var Auth_TransitionController = {

	// "+1" means state goes up one level
	Register: +1,

	// "+1" means state goes up one level
	VerifyEmail: +1,

	// "+1" means state goes up one level
	ResetPassword: +1,

	// "0" means state is unchanged
	Login: 0,

	// "0" means state is unchanged
	ResendEmail: 0,

	// "0" means state is unchanged
	ChangePassword: 0,

	// "-1" means state goes down one level
	ForgotPassword: -1,

	// "0" means state is unchanged
	TokenStrategy: 0,

	// "0" means state is unchanged
	Logout: 0,

	// "0" means state is unchanged
	RegisterFakeUser: 0,

	// "0" means state is unchanged
	ReverseRegister: 0,

	// "+1" means state goes up one level (should be "+2" but create_User already elevates 1 step)
	ReverseValidation: +1,

	//__FAKE_USER_INVITE: 0

	Emailless_Register: +2,
};

module.exports = Auth_TransitionController;