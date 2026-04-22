import { ansi, paint } from "./colors";
import { authClient } from "../lib/authClient";

const isYes = (v) => ["s", "sim", "y", "yes"].includes(v.toLowerCase());
const isNo = (v) => ["n", "não", "nao", "no"].includes(v.toLowerCase());

const isValidAge = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 && n <= 120;
};

const SIGNUP_ERRORS = {
  name_taken: "Esse nome já está em uso. Escolha outro.",
  invalid_name: "Nome inválido.",
  invalid_age: "Idade inválida.",
  weak_password: "Senha curta demais.",
};

const LOGIN_ERRORS = {
  invalid_credentials: "Usuário ou senha inválidos. Vamos do começo.",
};

export function buildOnboarding(state) {
  const steps = {
    hasAccount: {
      ask: "Bem-vindo(a). Você já tem uma conta? (s/n)",
      singleKey: ["s", "n"],
      next: (v) =>
        isYes(v) ? "loginName" : isNo(v) ? "signupName" : "hasAccountInvalid",
    },
    hasAccountInvalid: {
      ask: "Não entendi. Responda com s ou n, por favor.",
      singleKey: ["s", "n"],
      next: (v) =>
        isYes(v) ? "loginName" : isNo(v) ? "signupName" : "hasAccountInvalid",
    },

    loginName: {
      ask: "Que bom te ver de novo. Qual é o seu nome de usuário?",
      validate: (v) => v.trim().length > 0 || "Preciso de um nome de usuário.",
      apply: (v) => (state.userName = v.trim()),
      next: () => "loginPassword",
    },
    loginPassword: {
      ask: "E sua senha?",
      mask: true,
      apply: (v) => (state.userPassword = v),
      submit: async () => {
        const { ok, data } = await authClient.login({
          name: state.userName,
          password: state.userPassword,
        });
        if (!ok) {
          return {
            ok: false,
            message: LOGIN_ERRORS[data.error] ?? "Falha no login.",
            nextOnError: "loginName",
          };
        }
        state.user = data.user;
        return { ok: true };
      },
      next: () => "loginDone",
    },
    loginDone: {
      ask: () => `Bem-vindo de volta, ${state.userName}.`,
      terminal: true,
    },

    signupName: {
      ask: "Vamos criar uma conta então. Qual vai ser o seu nome de usuário?",
      validate: (v) => v.trim().length > 0 || "Preciso de um nome.",
      apply: (v) => (state.userName = v.trim()),
      next: () => "signupAge",
    },
    signupAge: {
      ask: () => `Prazer, ${state.userName}. Quantos anos você tem?`,
      validate: (v) =>
        isValidAge(v) ||
        `Hmm, "${v}" não parece uma idade. Me conta em número, por favor?`,
      apply: (v) => (state.userAge = String(Number(v))),
      next: () => "signupPassword",
    },
    signupPassword: {
      ask: "Agora escolha uma senha.",
      mask: true,
      validate: (v) =>
        v.length >= 4 ||
        "Senha curta demais. Tente uma com pelo menos 4 caracteres.",
      apply: (v) => (state.userPassword = v),
      next: () => "signupPasswordConfirm",
    },
    signupPasswordConfirm: {
      ask: "Confirme a senha.",
      mask: true,
      validate: (v) =>
        v === state.userPassword ||
        "As senhas não conferem. Vamos tentar de novo. Escolha uma senha.",
      onInvalid: () => {
        state.userPassword = "";
        return "signupPassword";
      },
      submit: async () => {
        const { ok, data } = await authClient.signup({
          name: state.userName,
          age: state.userAge,
          password: state.userPassword,
        });
        if (!ok) {
          return {
            ok: false,
            message: SIGNUP_ERRORS[data.error] ?? "Falha no cadastro.",
            nextOnError: "signupName",
          };
        }
        state.user = data.user;
        return { ok: true };
      },
      next: () => "signupDone",
    },
    signupDone: {
      ask: () => `Conta criada. Bem-vindo, ${state.userName}.`,
      terminal: true,
    },
  };

  return steps;
}

const PROMPT = "› ";

export async function runOnboarding({
  steps,
  startStep,
  state,
  scrollback,
  setMode,
  writeInputPrompt,
  clearInput,
  streamTokens,
  readNext,
}) {
  let stepName = startStep;

  while (stepName) {
    const step = steps[stepName];
    const askText = typeof step.ask === "function" ? step.ask() : step.ask;

    scrollback.write("\r\n");
    setMode(stepName, { mask: !!step.mask, singleKey: step.singleKey });
    await streamTokens(paint(ansi.fg, askText));

    if (step.terminal) {
      clearInput();
      return;
    }

    writeInputPrompt(PROMPT);

    const value = await readNext();
    clearInput();
    scrollback.writeln(
      paint(ansi.dim, PROMPT) + (step.mask ? "•".repeat(value.length) : value),
    );

    if (step.validate) {
      const result = step.validate(value);
      if (result !== true && typeof result === "string") {
        scrollback.write("\r\n");
        await streamTokens(paint(ansi.fg, result));
        stepName = step.onInvalid?.() ?? stepName;
        continue;
      }
    }

    step.apply?.(value);
    state.onChange?.();

    if (step.submit) {
      const result = await step.submit();
      if (!result.ok) {
        scrollback.write("\r\n");
        await streamTokens(paint(ansi.fg, result.message));
        stepName = result.nextOnError ?? stepName;
        continue;
      }
    }

    stepName = step.next(value);
  }
}
