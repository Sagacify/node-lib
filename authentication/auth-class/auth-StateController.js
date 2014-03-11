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
	ForgotPassword: [1, 2],

	// 2 means "VALIDATED" state
	TokenStrategy: 2,

	// 2 means "VALIDATED" state
	Logout: 2,

	// 0 means "NOTHING"
	RegisterFakeUser: 0,

	// 0 means "NOTHING"
	ReverseRegister: 0,

	// 1 means "UNVALIDATED" state
	ReverseValidation: 1,

	//__FAKE_USER_INVITE: 0

};

module.exports = Auth_StateController;