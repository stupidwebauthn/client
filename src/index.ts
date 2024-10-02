import * as client from "@passwordless-id/webauthn/dist/esm/client.js";
import type {
  AuthenticationJSON,
  CredentialInfo,
  RegistrationJSON,
} from "@passwordless-id/webauthn/dist/esm/types.d.ts";

export interface Login1ChallengeResponse {
  challenge: string;
  credentials: CredentialInfo[];
}

export interface Register3PasskeyChallengeResponse {
  challenge: string;
  email: string;
}

export interface UserJson {
  id: number;
  email: string;
  jwt_version: number;
  gdpr_delete_at: string | null;
  created_at: string | null;
}
export interface GdprData {
  user: UserJson;
  credentials: CredentialInfo[];
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
    }).then(FetchThen<Register3PasskeyChallengeResponse>);
  }
  public Register4AuthorizePasskey(o: Register3PasskeyChallengeResponse) {
    return client.register({ challenge: o.challenge, user: { name: o.email } });
  }
  public Register5PasskeyValidate(o: RegistrationJSON) {
    return fetch(`/auth/register/passkey/validate`, {
      method: "POST",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }

  // call api to request a challenge cookie and receive credentials from which to authenticate with
  public Login1Challenge(email: string) {
    return fetch(`/auth/login/challenge?email=${email}`, {
      method: "GET",
    }).then(FetchThen<Login1ChallengeResponse>);
  }
  // authenticate a credential
  public Login2Authenticate(o: Login1ChallengeResponse) {
    return client.authenticate({
      challenge: o.challenge,
      allowCredentials: o.credentials,
      timeout: 60000,
    });
  }
  public Login3Validate(o: AuthenticationJSON) {
    return fetch("/auth/login/validate", {
      method: "POST",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }

  public Logout() {
    return fetch(`/auth/logout`, { method: "GET" }).then(FetchThenEmpty);
  }

  public AuthValidate() {
    return fetch(`/auth/auth/validate`, { method: "GET" }).then(
      FetchThen<UserJson>
    );
  }

  public GdprData() {
    return fetch(`/auth/auth/gdpr/data`, { method: "GET" }).then(
      FetchThen<GdprData>
    );
  }
  public GdprDeleteSet() {
    return fetch(`/auth/auth/gdpr/delete-set`, { method: "POST" }).then(
      FetchThen<UserJson>
    );
  }
  public GdprDeleteUnset() {
    return fetch(`/auth/auth/gdpr/delete-unset`, { method: "POST" }).then(
      FetchThen<UserJson>
    );
  }
}

function FetchThenEmpty(res: Response): void {
  if (res.status >= 400) throw res;
}
function FetchThen<T>(res: Response): Promise<T> {
  if (res.status >= 400) throw res;
  return res.json() as Promise<T>;
}
