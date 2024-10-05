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
await client.Register2EmailVerify(params.c);
// email registered successfully
// creates an `swa_auth` cookie
```

### Register passkey

```ts
const res1 = await client.Register3PasskeyChallenge();
const res2 = await client.Register4PasskeyRegister(res1);
await client.Register5PasskeyVerify(res2);
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
const res1 = await client.Login1Challenge(email);
const res2 = await client.Login2Authenticate(res1);
await client.Login3Verify(res2);
// authenticated
// creates an `swa_auth` cookie
```

### Authentication

Check if the `swa_auth` cookie is valid

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

### Authentication with csrf blocking

```ts
await client.AuthCsrfChallenge();

// Or any api call that uses the csrf validate middleware
await client.AuthCsrfValidate();
```

### Double Validation

```ts
// assuming that the client is authenticated
const res1 = await client.AuthDoubleCheck1Challenge();
const res2 = await client.AuthDoubleCheck2Authenticate(res1);
await client.AuthDoubleCheckVerify(res2);
// creates an `swa_doublecheck_auth` cookie that is valid for a minute
// Now make a request to your server which requires an extra check to validate
```

### Logout

```ts
await client.Logout();
// navigate back to the login page
```
