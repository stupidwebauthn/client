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
  public Register2EmailVerify(c: string) {
    return fetch(`/auth/register/email/verify?c=${c}`, {
      method: "GET",
    }).then(FetchThenEmpty);
  }
  public Register3NoPasskeyLogin() {
    return fetch(`/auth/register/email/no-passkey-login`, {
      method: "POST",
    }).then(FetchThenEmpty);
  }
  public Register3PasskeyChallenge() {
    return fetch(`/auth/register/passkey/challenge`, {
      method: "POST",
    }).then(FetchThen<Register3PasskeyChallengeResponse>);
  }
  public Register4PasskeyRegister(o: Register3PasskeyChallengeResponse) {
    return client.register({ challenge: o.challenge, user: { name: o.email } });
  }
  public Register5PasskeyVerify(o: RegistrationJSON) {
    return fetch(`/auth/register/passkey/verify`, {
      method: "POST",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }

  public async Login123(email: string) {
    const res1 = await this.Login1Challenge(email);
    const res2 = await this.Login2Authenticate(res1);
    await this.Login3Verify(res2);
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
      allowCredentials: o.credentials.map((c) => c.id),
      timeout: 60000,
    });
  }
  public Login3Verify(o: AuthenticationJSON) {
    return fetch("/auth/login/verify", {
      method: "POST",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }

  public async AuthDoubleCheck123() {
    const res1 = await this.AuthDoubleCheck1Challenge();
    const res2 = await this.AuthDoubleCheck2Authenticate(res1);
    await this.AuthDoubleCheck3Verify(res2);
  }
  // call api to request a challenge cookie and receive credentials from which to authenticate with
  public AuthDoubleCheck1Challenge() {
    return fetch(`/auth/auth/doublecheck/challenge`, {
      method: "GET",
    }).then(FetchThen<Login1ChallengeResponse>);
  }
  // authenticate a credential
  public AuthDoubleCheck2Authenticate(o: Login1ChallengeResponse) {
    return client.authenticate({
      challenge: o.challenge,
      allowCredentials: o.credentials.map((c) => c.id),
      timeout: 60000,
    });
  }
  public AuthDoubleCheck3Verify(o: AuthenticationJSON) {
    return fetch("/auth/auth/doublecheck/verify", {
      method: "POST",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }

  public Logout() {
    return fetch(`/auth/logout`, { method: "GET" }).then(FetchThenEmpty);
  }

  public AuthCsrfChallenge() {
    return fetch(`/auth/auth/csrf/challenge`, { method: "GET" }).then(
      FetchThenEmpty
    );
  }
  public AuthCsrfValidate() {
    return fetch(`/auth/auth/csrf/validate`, { method: "GET" }).then(
      FetchThen<UserJson>
    );
  }

  public AuthValidate() {
    return fetch(`/auth/auth/validate`, { method: "GET" }).then(
      FetchThen<UserJson>
    );
  }

  public GdprData() {
    return fetch(`/auth/auth/doublecheck/gdpr/data`, { method: "GET" }).then(
      FetchThen<GdprData>
    );
  }
  public GdprDeleteSet() {
    return fetch(`/auth/auth/doublecheck/gdpr/delete-set`, {
      method: "POST",
    }).then(FetchThen<UserJson>);
  }
  public GdprDeleteUnset() {
    return fetch(`/auth/auth/doublecheck/gdpr/delete-unset`, {
      method: "POST",
    }).then(FetchThen<UserJson>);
  }
  public AuthPanic() {
    return fetch(`/auth/auth/doublecheck/panic`, {
      method: "PUT",
    }).then(FetchThenEmpty);
  }
  public AuthDeletePasskey3(o: AuthenticationJSON) {
    return fetch(`/auth/auth/doublecheck/verify`, {
      method: "DELETE",
      body: JSON.stringify(o),
    }).then(FetchThenEmpty);
  }
}

function FetchThenEmpty(res: Response): void {
  if (res.status >= 400) throw res;
}
function FetchThen<T>(res: Response): Promise<T> {
  if (res.status >= 400) throw res;
  return res.json() as Promise<T>;
}
