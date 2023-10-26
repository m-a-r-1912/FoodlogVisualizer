import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { CODE_VERIFIER_KEY, TOKEN_KEY } from '../utils/constants.js';

export default function Callback() {
    const router = useRouter();

    useEffect(() => {
        const authorizationCode = new URL(window.location.href).searchParams.get("code");
        const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);
        console.log("Authorization Code: ", authorizationCode);
        console.log("code verifier: ", codeVerifier);
        if (authorizationCode && codeVerifier){

            const params = {
                authorization_code: authorizationCode,
                code_verifier: codeVerifier
            };

            // Send the authorization code and code verifier to the backend and get user token in return           
            axios.post("http://localhost:8000/api/exchangetoken/", params)
                .then(response => {
                    console.log("OMG YOU LOGGED IN!!");
                    const token = response.data.token;
                    console.log("Token in callback: ", token);
                    localStorage.setItem(TOKEN_KEY, token);
                    router.push("/");
                })
                .catch(error => {
                    console.log("OH NO, YOU DIDN'T AUTHENTICATE");
                    router.push("/");
                });
        }
    }, []);
    return <div>Processing callback ...</div>
}