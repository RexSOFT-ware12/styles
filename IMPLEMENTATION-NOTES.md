# Hosted Paystack checkout update

- Product and sticker orders now return Paystack's `authorization_url`; the checkout page validates the HTTPS Paystack domain and redirects the browser to it.
- Premium and API Starter/Growth subscription sign-ups use the same hosted checkout redirect.
- The frontend no longer loads or invokes Paystack Inline. The obsolete inline helper was removed.
- Backend transaction initialization, reference storage, verification, webhook processing, subscription lifecycle handling, and ownership-gated private downloads remain server-side.
- API credit allowances continue to be provisioned by the API subscription and its verified renewal events. The supplied backend has no standalone API-credit top-up endpoint.
- Configure secret keys and merchant values in deployment environment settings. Never commit `.env` files.
