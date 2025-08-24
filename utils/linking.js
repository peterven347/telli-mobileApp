const linking = {
    prefixes: ['rsp://', 'https://rsp.com'],
    config: {
		screens: {
			Home: 'home',
			Profile: 'profile',
		},
	},
};

export default linking;



// <intent-filter android:autoVerify="true">
//   <action android:name="android.intent.action.VIEW" />

//   <category android:name="android.intent.category.DEFAULT" />
//   <category android:name="android.intent.category.BROWSABLE" />

//   <data android:scheme="rsp" />
//   <data android:scheme="https" android:host="rsp.com" />
// </intent-filter>
