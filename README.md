# Stupid Webauthn Client

## Installation

```sh
yarn add stupidwebauthn-client
```

## Code instructions

```ts
const client = new StupidWebauthnClient();
```

### Register email address

```html
<form>
  <input name="email" type="email" required />
</form>
```

```ts
const email = e.target.email.value;
await client.Register1EmailChallenge(email);
// send email
```

Run on opening at the validation link:

```ts
import queryString from "query-string";

const params = queryString.parse(location.search) as { c?: string };
// check if step 3
if (!params.c) throw "Invalid email verification url provided";
// validating email
await client.Register2EmailValidate(params.c);
// email registered successfully
```

### Register passkey

```ts
const res1 = await client.Register3PasskeyChallenge();
const res2 = await client.Register4AuthorizePasskey(res1.challenge);
await client.Register5PasskeyValidate(res2);
// passkey authenticated
```

### Login

```html
<form>
  <input name="email" type="email" required />
</form>
```

On form submission:

```ts
const email = e.target.email.value;
const res = await client.Login1Challenge(email);
// save these elsewhere
const challenge: string = res.challenge;
// list the credentials for the user to select
const credentials: CredentialSelect[] = res.credentials;
```

```jsx
<select>
  {credentials.map((credential) => (
    <option key={credential.id} value={credential.id}>
      {credential.name}
    </option>
  ))}
</select>
```

On credential selection:

```ts
const res = await client.Login2Authenticate(challenge.challenge, credentials);
await client.Login3Validate(res, credential.challenge.id);
// authenticated
```

### Authentication

```ts
client
  .AuthValidate()
  .then(() => {
    // is authenticated
  })
  .catch((err) => {
    // navigate back to the login page
  });
```

### Logout

```ts
await client.Logout();
// navigate back to the login page
```
