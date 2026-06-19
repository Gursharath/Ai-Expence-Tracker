export interface AgentLog {
    timestamp: string
    action: string
    detail: string
}

export interface AgentResponse<T = any> {
    agentName: string
    success: boolean
    result: T
    logs: AgentLog[]
    executionTime: number // runtime in milliseconds
}

export interface BaseAgent<T = any> {
    name: string
    description: string
    run(userId: string, context?: any): Promise<AgentResponse<T>>
}
