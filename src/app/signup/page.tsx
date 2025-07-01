// Автоматический вход после успешной регистрации
setTimeout(async () => {
  addActionLog("Автоматический вход", "pending", "Выполняем вход в систему...");
  const res = await signIn("credentials", { 
    email, 
    password,
    redirect: false,
    callbackUrl: "/dashboard"
  });
  if (res?.error) {
    addActionLog("Ошибка входа после регистрации", "error", res.error);
    setError("Ошибка входа после регистрации: " + res.error);
    setSuccess(false);
    return;
  }
  if (res?.url) {
    window.location.href = res.url;
  }
}, 1000); 