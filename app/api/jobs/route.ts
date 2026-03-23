import { NextRequest, NextResponse } from "next/server"

// ===== JSearch (RapidAPI) types =====
interface JSearchJob {
    job_id: string
    job_title: string
    employer_name: string
    job_city: string
    job_state: string
    job_country: string
    job_description: string
    job_apply_link: string
    job_is_remote: boolean
    job_posted_at_datetime_utc: string
    job_min_salary: number | null
    job_max_salary: number | null
    job_salary_currency: string | null
    job_employment_type: string
    employer_logo: string | null
    job_highlights?: {
        Qualifications?: string[]
        Responsibilities?: string[]
    }
}

interface JSearchResponse {
    status: string
    data: JSearchJob[]
    parameters: {
        page: number
        num_pages: number
    }
}

// ===== Arbeitnow types (fallback) =====
interface ArbeitnowJob {
    slug: string
    company_name: string
    title: string
    description: string
    remote: boolean
    url: string
    tags: string[]
    location: string
    created_at: number
}

interface ArbeitnowResponse {
    data: ArbeitnowJob[]
    links: { next: string | null }
    meta: { current_page: number; last_page: number }
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim()
}

function timeAgo(dateStr: string | number): string {
    const date = typeof dateStr === "number" ? dateStr * 1000 : new Date(dateStr).getTime()
    const seconds = Math.floor((Date.now() - date) / 1000)
    if (seconds < 3600) return `${Math.max(1, Math.floor(seconds / 60))} minutes ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return `${Math.floor(seconds / 604800)} weeks ago`
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string {
    if (!min && !max) return "Not disclosed"
    const curr = currency || "INR"
    if (min && max) return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${curr} ${min.toLocaleString()}+`
    return `${curr} ${max!.toLocaleString()}`
}

// ===== JSearch fetcher (primary — Indian jobs) =====
async function fetchFromJSearch(search: string, page: number) {
    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) return null

    const query = search
        ? `${search} in India`
        : "software developer in India"

    const url = new URL("https://jsearch.p.rapidapi.com/search")
    url.searchParams.set("query", query)
    url.searchParams.set("page", page.toString())
    url.searchParams.set("num_pages", "1")
    url.searchParams.set("country", "in")
    url.searchParams.set("date_posted", "month")

    const response = await fetch(url.toString(), {
        headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
        next: { revalidate: 600 }, // Cache 10 min
    })

    if (!response.ok) {
        console.error(`JSearch API error: ${response.status}`)
        return null
    }

    const data: JSearchResponse = await response.json()

    const jobs = data.data.map((job) => ({
        id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ") || "India",
        description: stripHtml(job.job_description).slice(0, 300) + "...",
        url: job.job_apply_link,
        tags: [
            job.job_employment_type,
            ...(job.job_highlights?.Qualifications?.slice(0, 2) || []),
        ].filter(Boolean).map((t) => t.length > 30 ? t.slice(0, 30) + "..." : t),
        remote: job.job_is_remote,
        postedAt: timeAgo(job.job_posted_at_datetime_utc),
        salary: formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency),
        source: "LinkedIn/Indeed/Naukri",
        logo: job.employer_logo,
    }))

    return {
        jobs,
        totalPages: data.parameters.num_pages || 1,
        currentPage: data.parameters.page || page,
        hasMore: page < (data.parameters.num_pages || 1),
    }
}

// ===== Arbeitnow fetcher (fallback) =====
async function fetchFromArbeitnow(search: string, page: number) {
    const url = new URL("https://arbeitnow.com/api/job-board-api")
    url.searchParams.set("page", page.toString())

    const response = await fetch(url.toString(), {
        next: { revalidate: 300 },
    })

    if (!response.ok) throw new Error(`Arbeitnow API error: ${response.status}`)

    const data: ArbeitnowResponse = await response.json()

    let jobs = data.data.map((job) => ({
        id: job.slug,
        title: job.title,
        company: job.company_name,
        location: job.location || (job.remote ? "Remote" : "Not specified"),
        description: stripHtml(job.description).slice(0, 300) + "...",
        url: job.url,
        tags: job.tags.slice(0, 5),
        remote: job.remote,
        postedAt: timeAgo(job.created_at),
        salary: "Not disclosed",
        source: "Arbeitnow",
        logo: null as string | null,
    }))

    if (search) {
        const q = search.toLowerCase()
        jobs = jobs.filter(
            (j) =>
                j.title.toLowerCase().includes(q) ||
                j.company.toLowerCase().includes(q) ||
                j.location.toLowerCase().includes(q) ||
                j.tags.some((t) => t.toLowerCase().includes(q))
        )
    }

    return {
        jobs,
        totalPages: data.meta.last_page,
        currentPage: data.meta.current_page,
        hasMore: data.links.next !== null,
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const page = parseInt(searchParams.get("page") || "1", 10)

    try {
        // Try JSearch first (Indian jobs from LinkedIn/Indeed/Naukri)
        const jsearchResult = await fetchFromJSearch(search, page)
        if (jsearchResult && jsearchResult.jobs.length > 0) {
            return NextResponse.json(jsearchResult)
        }

        // Fallback to Arbeitnow
        const arbeitnowResult = await fetchFromArbeitnow(search, page)
        return NextResponse.json(arbeitnowResult)
    } catch (error) {
        console.error("Failed to fetch jobs:", error)
        return NextResponse.json(
            { error: "Failed to fetch job listings. Please try again later." },
            { status: 500 }
        )
    }
}
