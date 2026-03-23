import { JobsApiResponse, JobSearchParams } from "./jobTypes"

export async function fetchOffCampusJobs(
    params: JobSearchParams = {}
): Promise<JobsApiResponse> {
    const searchParams = new URLSearchParams()

    if (params.search) {
        searchParams.set("search", params.search)
    }
    if (params.page) {
        searchParams.set("page", params.page.toString())
    }

    const url = `/api/jobs?${searchParams.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
            errorData.error || `Failed to fetch jobs (${response.status})`
        )
    }

    return response.json()
}
