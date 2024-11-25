function API() {
  this.ROOT = "/"
  this.API = "/api"
  // auth
  this.AUTH_REGISTER = "/register"
  this.AUTH_LOGIN = "/login"
  // users
  this.USER_UPDATE_USERNAME = "/update-username/:id"
  this.USER_UPDATE_NAME = "/update-name/:id"
  this.USER_UPDATE_EMAIL = "/update-email/:id"
  this.USER_UPDATE_PASSWORD = "/update-password/:id"
  this.USER_UPDATE_PHONE = "/update-phone/:id"
  this.USER_UPDATE_ADDRESS = "/update-address/:id"
  this.USER_DELETE = "/delete/:id"
  this.USER_GET = "/find/:id"
  this.USER_GET_ALL = "/"
  this.USER_GET_ALL_STATS = "/stats"
  this.AUTH = "/auth"
  this.USERS = "/users"
}

const api = new API()
export default api
