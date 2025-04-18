import React, { useCallback, useEffect, useRef, useState} from 'react';
import { Image, Keyboard, Linking, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Divider, RadioButton, TextInput } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView  } from '@gorhom/bottom-sheet';
import Mci from 'react-native-vector-icons/MaterialCommunityIcons';
import Ion from 'react-native-vector-icons/Ionicons';
import { useDomainImg, useToken, useUrl, useUser } from "../../store/useStore";
import BottomSheetForImg from './BottomSheetForImg';
import { Easing } from 'react-native-reanimated';

const emailRegex = /^(?=.{1,256}$)(?=.{1,64}@.{1,255}$)(?=[^@]+@[^@]+\.[a-zA-Z]{2,63}$)^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const isVerifiedEmail = {}

export default function AddDomain(){
    const bottomSheetRef = useRef(null);
    const [loading, setLoading] = useState(false)
    const { imageUri, setImageUri } = useDomainImg()
    const { accessToken } = useToken()
    const { url } = useUrl()
    const { user } = useUser()
    const scrollRef = useRef(null)
    const [checked, setChecked] = useState("public")
    const [domainName, setDomainName] = useState("name")
    const [sector, setSectorName] = useState("")
    const [delegates, setDelegates] = useState([{ id: 1, email: "", res: "" }]);
    const [delegateTrack, setdelegateTrack] = useState(false)
    const subject = "You're invited to join Proman";
    const body = 'This is a test message.';
    const inputRefs = useRef([]);
    useEffect(() => {
      if (inputRefs.current.length > 0) {
        const lastIndex = inputRefs.current.length - 1;
        inputRefs.current[lastIndex]?.focus();
      }
    }, [delegateTrack]);

    const addDelegate = () => {
		setDelegates(prev => [
			...prev,
			{ id: Math.random(), email: "", checked: false, res: "" }
    	]);
        setdelegateTrack(prev => !prev)
    };

	const removeDelegate = (id) => {
		setDelegates(prev => 
			prev.filter( i => i.id !== id)
		);
  	};

	const editEmail = (id, e, checked=false, res="") => {
		setDelegates((prev) => 
			prev.map((i) => {
				if (i.id == id) {
					return {
						...i,
						email: e,
                        checked: checked,
                        res: emailRegex.test(e) ? res : "invalid"
					}
				};
				return i;
			})
		)
	};

    const createDomain = async() => {
        // setLoading(true)
        const formData = new FormData()
        formData.append("domainName", domainName)
        formData.append("status", checked)
        formData.append("title", sector)
        formData.append("delegates", [...new Set(delegates.map(i => i.email).filter(email => email && emailRegex.test(email)))].join(","))
        if (imageUri.uri) {
            formData.append("file", {
                uri: imageUri.uri,
                type: imageUri.type,
                name: domainName  + "-" + imageUri.fileName 
            })
        }
        const res = await fetch(`${url}/api/user/create-domain`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
            method: "POST",
            body: formData
        })
        const val = await res.json()
        if(val) {
            console.log(val)
            setLoading(false)
            // setDelegates([{ id: 1, email: "", res: "" }])
            // setSectorName("")
            // setDomainName("")
        }
    };

    const verifyEmail = async(id, email) => {
        if(email === user.email) {
            editEmail(id, email, true, "exists")
            return;
        }
        if(isVerifiedEmail.hasOwnProperty(email)) {
            editEmail(id, email, true, isVerifiedEmail[email])
        }
        else if(emailRegex.test(email)) {
            editEmail(id, email, false, "loading")
            const verify = await fetch(`${url}/api/user/verify-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email
                })
            })
            const res = await verify.json()
            editEmail(id, res.email, true, res.message)
            if(res.message === "exists") {
                isVerifiedEmail[email] = "exists"
            }else if(res.message === "notExist") {
                isVerifiedEmail[email] = "notExist"
            }
        }
        else {
            // !checked && editEmail(id, email, checked)
        }
    };

    const handleSheetChanges = useCallback((index) => {
        // indexRef.current = index;
        // if(indexRef?.current !== -1){
        //     Keyboard.isVisible() && Keyboard.dismiss()
        // }
    }, []);

    const showBottomSheet = () => {
        if(Keyboard.isVisible()) {
            Keyboard.dismiss()
            setTimeout(() => {
                bottomSheetRef.current.snapToIndex(1, {
                    duration: 200,
                    easing: Easing.out(Easing.ease)
                  })
            }, 370)
        } else {
            bottomSheetRef.current.snapToIndex(1, {
                duration: 200,
                easing: Easing.out(Easing.ease)
            })
        }
    };

    const renderBackdrop = useCallback(
        (props) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
            />
        ), []);
        
    return(
        <GestureHandlerRootView style={{paddingBottom: 35, backgroundColor: "#fff", flex: 1}}>
            <View style={styles.container}>
                <Mci
                    name="warehouse"
                    color='#339'
                    size={26}
                    marginTop={18}
                    marginStart={4}
                    onPress={() => {
                    }}
                />
                <TextInput
                    label={"Domain name"}
                    value={domainName}
                    textColor="#000b"
                    maxLength={100}
                    multiline={false}
                    style={{ width: "80%", backgroundColor: "#fff"}}
                    onChangeText={setDomainName}
                />
            </View>
            <View style={{flexDirection: "row", columnGap: 69, marginBottom: 18}}>
                <RadioButton.Item
                    label="public"
                    value="public"
                    status= { checked === "public" ? "checked" : "unchecked" }
                    color='#339'
                    rippleColor="#fff"
                    labelStyle={{color: "#333"}}
                    position='leading'
                    onPress={() => setChecked("public")}
                />
                <RadioButton.Item
                    label="private"
                    value="private"
                    status= { checked === "private" ? "checked" : "unchecked" }
                    color='#339'
                    rippleColor="#fff"
                    labelStyle={{color: "#333"}}
                    position='leading'
                    onPress={() => setChecked("private")}
                />		
            </View>
            <View style={{flexDirection: "row", alignItems: "center", columnGap: 3}}>
                <Pressable style={styles.imgView} onPress={showBottomSheet}>
                    {
                        imageUri.uri ? <Image source={{uri: imageUri.uri}} width={100} height={100} style={{borderRadius: 4}}/> :
                        <Mci name="plus" size={26} color="#666"/>
                    }
                </Pressable>
                {
                    imageUri.uri ?
                    <TouchableOpacity style={{flexDirection: "row", alignItems: "center"}} onPress={() => setImageUri("")}>
                        <Text style={{fontWeight: "500", color: "#999"}}>delete image</Text>
                        <Mci name="delete-outline" size={22} color="#f009"/>
                    </TouchableOpacity> :
                    <View style={{flexDirection: "row"}}>
                        <Text style={{fontWeight: "500", color: "#666"}}>upload image</Text>
                        <Ion name="image-outline" size={16} color="#66b" marginStart={2}/>
                    </View>
                }
            </View>
            <ScrollView
                ref={scrollRef}
                onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
                keyboardShouldPersistTaps="always"
                style={{backgroundColor: "#fff", marginTop: 40}}>

            <Text style={{paddingStart: 25, color: "#ccc"}}>Add at least 1 sector</Text>
            <TextInput
                // label={`sector`}
                value={sector}
                textColor="#000b"
                placeholder="sector"
                placeholderTextColor="#ccc"
                mode="outlined"
                maxLength={100}
                multiline={false}
                dense={true}
                returnKeyType='next'                
                outlineStyle={{ borderWidth: 0, borderBottomWidth:1 }}
                style={{ width: "90%", backgroundColor: "#fff", marginBottom: 12, marginStart: 22}}
                onChangeText={setSectorName}
            />
            {sector &&
                <>
                    <Text style={{paddingStart: 25, marginBottom: 6, color: "#ccc"}}>Add delegates to sector</Text>
                    {delegates.map((delegate, index) => (
                    <View key={index} style={styles.delegatesContainer}>
                        <Mci
                            name={index === delegates.length - 1 ? "plus-circle" : "minus-circle"}
                            color={index === delegates.length - 1 ? '#339' : '#f009'}
                            size={26}
                            marginBottom={2}
                            marginStart={4}
                            onPress={() => {
                            if (index === delegates.length - 1) {
                                addDelegate();
                            } else {
                                removeDelegate(delegate.id);
                            }
                            }}
                        />
                        <TextInput
                            ref={ref => (inputRefs.current[index] = ref)}
                            label={`delegate${index + 1}`}
                            value={delegate.email}
                            textColor={delegates.slice(0, index).some(prev => prev.email.toUpperCase() === delegate.email.toUpperCase())  || delegate.email.toUpperCase() === user.email.toUpperCase()  ? "#bbb" : "#000b"}
                            mode="outlined"
                            maxLength={50}
                            multiline={false}
                            dense={true}
                            returnKeyType='next'
                            right={
                            delegate.res === "notExist" ?
                            <TextInput.Affix text="invite" textStyle={styles.textAffix} onPress={() => Linking.openURL(`mailto:${delegate.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`)}/>
                            :
                            <TextInput.Icon
                                icon={delegate.res === "exists"
                                    ? "check" : delegate.res === "invalid"
                                    ? "exclamation" : delegate.res === "loading"
                                    ? () => <ActivityIndicator size={10}/> :() => null}
                                color={delegate.res === "exists"
                                    ? "#77b3a2" : delegate.res === "invalid"
                                    ? "#f009" : () => null}
                                size={16}
                                />
                            }
                            outlineStyle={{ borderWidth: 0, borderBottomWidth:1 }}
                            contentStyle={{ fontStyle: delegates.slice(0, index).some(prev => prev.email === delegate.email) || delegate.email.toUpperCase() === user.email.toUpperCase() ? "italic" : "normal"}}
                            style={{ width: "90%", backgroundColor: "#fff", marginBottom: 12}}
                            onChangeText={(e) => editEmail(delegate.id, e, false, "")}
                            onBlur={() => {verifyEmail(delegate.id, delegate.email)}}
                        />
                    </View>
                    ))}
                </>
            }
            </ScrollView>
            {
                loading ? <ActivityIndicator marginTop={20} size={20}/> :
                <Button
                mode='contained'
                style={{width: "auto", alignSelf: "center", marginTop: 8}}
                onPress={createDomain}>
                    ADD DELEGATES
                </Button>
            }
            
            <BottomSheet
                ref={bottomSheetRef}
                index={-1}
                enablePanDownToClose={true}
                snapPoints ={['55%']}
                handleIndicatorStyle={{backgroundColor: "#66b"}}
                handleStyle={styles.handleStyle}
                enableOverDrag={false}
                backdropComponent={renderBackdrop}
                opacity={0.9}
                onChange={handleSheetChanges}
                backgroundStyle={{borderTopLeftRadius: 20, borderTopRightRadius: 20}}
                >
                <BottomSheetView style={styles.bottomSheetView}>
                    <BottomSheetForImg bottomSheetRef={bottomSheetRef}/>
                </BottomSheetView>
            </BottomSheet>
        </GestureHandlerRootView>
    )
}

const styles = StyleSheet.create({
    bottomSheetView: {
        flex: 1,
        paddingTop: 16,
        backgroundColor: "#fff4"
    },
    container: {
        width: "90%",
        paddingStart: 18,
        marginBottom: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    delegatesContainer: {
        width: "90%",
        paddingStart: 18,
        flexDirection: "row",
        alignItems: "center",
    },
    handleStyle: {
        backgroundColor: "#fff4",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20
    },
    imgView: {
        width: 100,
        height: 100,
        borderRadius: 8,
        borderWidth: 2,
        marginStart: 26,
        marginTop: 8,
        borderColor: "#ccc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    textAffix: {
        fontSize: 12,
        borderRadius: 8,
        paddingHorizontal: 6,
        textAlign: "center",
        color: "#c00",
        backgroundColor: "#fdd",
    }
})
