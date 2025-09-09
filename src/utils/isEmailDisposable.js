import disposableDomains from "disposable-email-domains";

const isEmailDisposable = (email) => {
  const domain = email.split("@")[1];
  return disposableDomains.includes(domain);
};

export default isEmailDisposable;
