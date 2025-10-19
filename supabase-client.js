// Supabase Client Configuration
const SUPABASE_URL = "https://hwgsizogkihxeipabzhb.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_g35AyOwREufG2wx4g3AwQQ_3zFzA802"

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL
    this.key = SUPABASE_ANON_KEY
  }

  async request(method, path, body = null) {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(`${this.url}/rest/v1${path}`, options)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Database error")
    }

    return response.json()
  }

  // Users
  async saveUser(user) {
    const existing = await this.getUser(user.email)
    if (existing) {
      return this.request("PATCH", `/users?email=eq.${encodeURIComponent(user.email)}`, user)
    }
    return this.request("POST", "/users", user)
  }

  async getUser(email) {
    const result = await this.request("GET", `/users?email=eq.${encodeURIComponent(email)}`)
    return result.length > 0 ? result[0] : null
  }

  async getUsers() {
    return this.request("GET", "/users")
  }

  async getUsersByType(type) {
    return this.request("GET", `/users?type=eq.${type}`)
  }

  // Students
  async saveStudent(student) {
    const existing = await this.request("GET", `/students?id=eq.${student.id}`)
    if (existing.length > 0) {
      return this.request("PATCH", `/students?id=eq.${student.id}`, student)
    }
    return this.request("POST", "/students", student)
  }

  async getStudents() {
    return this.request("GET", "/students")
  }

  // Pending Approvals
  async savePendingApproval(approval) {
    return this.request("POST", "/pending_approvals", approval)
  }

  async getPendingApprovals() {
    return this.request("GET", "/pending_approvals")
  }

  async removePendingApproval(id) {
    return this.request("DELETE", `/pending_approvals?id=eq.${id}`)
  }

  // Attendance Records
  async saveAttendanceRecord(record) {
    return this.request("POST", "/attendance_records", record)
  }

  async getAttendanceRecords() {
    return this.request("GET", "/attendance_records")
  }

  // Notifications
  async saveNotification(notification) {
    return this.request("POST", "/notifications", notification)
  }

  async getNotifications() {
    return this.request("GET", "/notifications")
  }

  // Summons
  async saveSummons(summons) {
    return this.request("POST", "/summons", summons)
  }

  async getSummons() {
    return this.request("GET", "/summons")
  }

  // Password Reset Tokens
  async savePasswordResetToken(email, token) {
    const expires = new Date(Date.now() + 15 * 60 * 1000).toISOString()
    return this.request("POST", "/password_reset_tokens", { email, token, expires })
  }

  async getPasswordResetTokens() {
    return this.request("GET", "/password_reset_tokens")
  }

  async verifyPasswordResetToken(email, token) {
    const result = await this.request("GET", `/password_reset_tokens?email=eq.${encodeURIComponent(email)}`)
    if (result.length === 0) return false

    const tokenData = result[0]
    if (new Date() > new Date(tokenData.expires)) {
      await this.request("DELETE", `/password_reset_tokens?email=eq.${encodeURIComponent(email)}`)
      return false
    }

    return tokenData.token === token
  }

  async removePasswordResetToken(email) {
    return this.request("DELETE", `/password_reset_tokens?email=eq.${encodeURIComponent(email)}`)
  }
}

// Initialize Supabase client
const supabaseClient = new SupabaseClient()
