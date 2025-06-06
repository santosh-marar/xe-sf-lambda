function Message() {
  this.USERNAME_MAX_CHARACTER = "User name has not more than 30 characters"
  this.USERNAME_MIN_CHARACTER = "User name has not less than 3 characters"
  this.API_WORKING = "API is working"
  this.SOMETHING_WENT_WRONG = "Something went wrong"
  // auth
  this.USERNAME_NOT_VALID = "username is not valid"
  this.NAME_NOT_VALID = "name is not valid"
  this.EMAIL_NOT_VALID = "email is not valid"
  this.PASSWORD_NOT_VALID = "password is not valid"
  this.PHONE_NOT_VALID = "phone is not valid"
  this.ADDRESS_NOT_VALID = "address is not valid"
  this.USERNAME_EXIST = "username is exist"
  this.EMAIL_EXIST = "email is exist"
  this.PHONE_EXIST = "phone is exist"
  this.USER_NOT_CREATE = "user is not create, please try again"
  this.USER_CREATE_SUCCESS = "user is create success, please login"
  this.USER_NOT_FOUND = "user is not found"
  this.PASSWORD_NOT_MATCH = "password is not match"
  this.USER_LOGIN_SUCCESS = "user is login success"
  // token
  this.TOKEN_NOT_VALID = "Token not valid"
  this.NOT_AUTHENTICATED = "Not authenticated"
  this.UNAUTHORIZED = "Unauthorized"
  this.NOT_ALLOWED = "Not allowed"
  // user
  this.USERNAME_NOT_CHANGE = "username is not change"
  this.USERNAME_CHANGE_SUCCESS = "username is change success"
  this.NAME_NOT_CHANGE = "name is not change"
  this.NAME_CHANGE_SUCCESS = "name is change success"
  this.EMAIL_NOT_CHANGE = "email is not change"
  this.EMAIL_CHANGE_SUCCESS = "email is change success"
  this.PASSWORD_NOT_CHANGE = "password is not change"
  this.PASSWORD_CHANGE_SUCCESS = "password is change success"
  this.PHONE_NOT_CHANGE = "phone is not change"
  this.PHONE_CHANGE_SUCCESS = "phone is change success"
  this.ADDRESS_NOT_CHANGE = "address is not change"
  this.ADDRESS_CHANGE_SUCCESS = "address is change success"
  this.USER_NOT_DELETE = "user is not delete, please try again"
  this.USER_DELETE_SUCCESS = "user is delete success"
  this.USER_FOUND = "user is found"
}

const message = new Message()
export default message
