export interface OffCampusJob {
    id: string
    title: string
    company: string
    location: string
    description: string
    url: string
    tags: string[]
    remote: boolean
    postedAt: string
    salary: string
    source: string | null
    logo: string | null
}

export interface JobSearchParams {
    search?: string
    page?: number
}

export interface JobsApiResponse {
    jobs: OffCampusJob[]
    totalPages: number
    currentPage: number
    hasMore: boolean
}
