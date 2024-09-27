import * as client from "@passwordless-id/webauthn/dist/esm/client.js";
import type {
  AuthenticationJSON,
  CredentialInfo,
  RegistrationJSON,
} from "@passwordless-id/webauthn/dist/esm/types.d.ts";

export interface CredentialSelect {
  id: number;
  name: string;
  credential: CredentialInfo;
}
export interface Login1ChallengeResponse {
  challenge: string;
  credentials: CredentialSelect[];
}

export default class PasskeyFdClient {
  public Register1EmailChallenge(email: string) {
    return fetch(`/auth/register/email/challenge?email=${email}`, {
      method: "GET",
    }).then(FetchThenEmpty);
  }
  public Register2EmailValidate(c: string) {
    return fetch(`/auth/register/email/validate?c=${c}`, {
      method: "GET",
    }).then(FetchThenEmpty);
  }
  public Register3PasskeyChallenge() {
    return fetch(`/auth/register/passkey/challenge`, {
      method: "POST",
    }).then(FetchThen<{ challenge: string }>);
  }
  public Register4AuthorizePasskey(challenge: string) {
    return client.register({ challenge, user: window.location.hostname });
  }
  public Register5PasskeyValidate(reqBody: RegistrationJSON) {
    return fetch(`/auth/register/passkey/validate`, {
      method: "POST",
      body: JSON.stringify(reqBody),
    }).then(FetchThenEmpty);
  }

  // call api to request a challenge cookie and receive credentials from which to authenticate with
  public Login1Challenge(email: string) {
    return fetch(`/auth/login/challenge?email=${email}`, {
      method: "GET",
    }).then(FetchThen<Login1ChallengeResponse>);
  }
  // authenticate a credential
  public Login2Authenticate(challenge: string, credential: CredentialInfo) {
    return client.authenticate({
      challenge,
      allowCredentials: [credential],
      timeout: 60000,
    });
  }
  public Login3Validate(reqBody: AuthenticationJSON, cred_id: number) {
    return fetch(`/auth/login/validate?cred_id=${cred_id}`, {
      method: "POST",
      body: JSON.stringify(reqBody),
    }).then(FetchThenEmpty);
  }

  public AuthValidate() {
    return fetch(`/auth/auth/validate`, { method: "POST" }).then(
      FetchThenEmpty
    );
  }

  public Logout() {
    return fetch(`/auth/logout`, { method: "GET" }).then(FetchThenEmpty);
  }
}

function FetchThenEmpty(res: Response): void {
  if (res.status >= 400) throw res;
}
function FetchThen<T>(res: Response): Promise<T> {
  if (res.status >= 400) throw res;
  return res.json() as Promise<T>;
}
