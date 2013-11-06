var Auth_StateController = {

	// 0 means the "NOTHING" state
	Register: 0,

	// 1 means "UNVALIDATED" state
	VerifyEmail: 1,

	// 1 means "UNVALIDATED" state
	ResetPassword: 1,

	// 1 means "UNVALIDATED" state
	ResendEmail: 1,

	// 2 means "VALIDATED" state
	Login: 2,

	// 2 means "VALIDATED" state
	ChangePassword: 2,

	// 2 means "VALIDATED" state
	ForgotPassword: 2,

	// 2 means "VALIDATED" state
	TokenStrategy: 2,

	// 2 means "VALIDATED" state
	Logout: 2,

};

module.exports = Auth_StateController;