export const enum GAME_MSG_TYPE {
	/****************** 客户端消息 *******************/
	/**
	 * 错误
	*/
	error,
	/**
	 * 登录
	*/
	login,
	/**
	 * 发送验证码
	*/
	sendVerificationCode,
	/**
	 * 更新用户信息
	*/
	updateUserInfo,
	queryActivePet,
	queryBag,
	scan,
	carry,
	carryEnd,
	queryPetCarryGoods,
	carryDraw,
	battleMatching,
	battleEnd,
	expendEnery,
	applyAppFriend,
	lookBusinessmanGoods,
	addOnHook,
	removeOnHook,
	changeIdentity,
	rechargeMoney,
	friendList,
	friendApply,
	friendApplyActive,
	friendApplyTo,
	friendApplyFrom,
	friendMessage,
	friendSend,
	exitLogin
}