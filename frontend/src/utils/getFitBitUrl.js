
export const getAuthURL = async (code_challenge, oauth_redirect, oauth_client_id) => {
    const rootUrl = "https://www.fitbit.com/oauth2/authorize"
    const code_challenge_method = "S256"
    
    console.log('Redirect URI:', oauth_redirect);
    console.log('Client ID:', oauth_client_id);

    const options = {
        redirect_uri: oauth_redirect,
        client_id: oauth_client_id,
        scope: "activity nutrition profile settings",
        prompt: "consent",
        response_type: "code",
        code_challenge_method:code_challenge_method,
        code_challenge: code_challenge
    };

    const qs = new URLSearchParams(options);

    return `${rootUrl}?${qs.toString()}`;
}