class HttpRequest {
    constructor() {
        this.baseUrl = "https://spotify.f8team.dev/api/"
    }
    async _send(path, method, data, options = {}) {
        try {
            const _options = {
                ...options,
                method,
                headers: {
                    ...(options?.headers || {}),
                    "Content-Type": "application/json",
                },
            }
            if (data) {
                _options.body = JSON.stringify(data)
            }
            const accessToken = localStorage.getItem("accessToken")
            if (accessToken) {
                _options.headers.Authorization = `Bearer ${accessToken}`
            }
            const res = await fetch(`${this.baseUrl}${path}`, _options)
            const response = await res.json()

            if (!res.ok) {
                const error = new Error(`HTTP error: ${res.status}`)
                error.response = response
                error.status = res.status
                throw error
            }
            return response
        } catch (error) {
            throw error
        }
    }
    async get(path, options) {
        return await this._send(path, "GET", null, options)
    }

    async post(path, data, options) {
        return await this._send(path, "POST", data, options)
    }
    async put(path, options) {
        return await this._send(path, "PUT", null, options)
    }

    async patch(path, data, options) {
        return await this._send(path, "PATCH", data, options)
    }
    async del(path, options) {
        return await this._send(path, "DELETE", null, options)
    }
}

const httpRequest = new HttpRequest()

export default httpRequest
