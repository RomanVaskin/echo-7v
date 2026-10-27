/** Bearer check for scheduled jobs and staff endpoints. Refuses everything while the secret is unset. */
export function authorized(request: Request, secret: string | undefined) {
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
}
