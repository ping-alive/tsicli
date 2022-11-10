import chalk from "chalk";
import prompts, { PromptObject } from "prompts";

type TsicliRegister = {
  types: {
    [k in `#${string}`]:
      | "string"
      | "number"
      | "string[]"
      | "number[]"
      | "boolean"
      | PromptObject;
  };
  args: string[][];
  runners: {
    [k: string]: Function;
  };
};
export async function tsicli(
  rawInputArgs: string[],
  config: TsicliRegister,
  argStartIndex: number = 2
): Promise<void> {
  const { types, args, runners } = config;
  const inputArgs = rawInputArgs.slice(argStartIndex);

  const matchings = args.filter((arg) => {
    if (inputArgs.length === 0) {
      return true;
    }
    return checkBelongs(types, arg.slice(0, inputArgs.length), inputArgs);
  });

  if (matchings.length === 0) {
    console.log(chalk.red("Cannot find the matching args"));
    return;
  } else if (matchings.length === 1) {
    const matching = matchings[0];
    const filteredMatching = matching.filter(
      (elem) => elem.startsWith("#") === false
    );
    const runnerName = filteredMatching.join("_");
    if (!runners[runnerName]) {
      throw new Error(`Needs to register the runner named "${runnerName}"`);
    }

    // 아직 모든 입력이 되지 않았다면 개별 타입별로 추가 입력이 필요
    if (matching.length !== inputArgs.length) {
      const extraInputs = matching.slice(inputArgs.length);
      const questions: PromptObject<string>[] = extraInputs.map((arg) => {
        const type = types[arg as keyof typeof types];
        if (type === undefined) {
          throw new Error(`Unregistered type ${arg}`);
        }

        if (type === "string") {
          return {
            type: "text",
            name: arg,
            message: `Please input ${arg}`,
          };
        } else if (type === "number") {
          return {
            type: "number",
            name: arg,
            message: `Please input ${arg}`,
          };
        } else if (type === "number[]" || type === "string[]") {
          return {
            type: "list",
            name: arg,
            message: `Please input ${arg}`,
          };
        } else if (type === "boolean") {
          return {
            type: "confirm",
            name: arg,
            message: `Please input ${arg}`,
          };
        } else if (typeof type === "object") {
          return type;
        } else {
          throw new Error(`Unhandled type ${type} on ${arg}`);
        }
      });
      const res = await prompts(questions);
      const runnerArguments = extraInputs.map((arg) => {
        if (arg.startsWith("#") && res[arg]) {
          const type = types[arg as keyof typeof types];
          if (type === "number[]") {
            return res[arg].map((r: string[]) => Number(r));
          }
          return res[arg];
        } else {
          return arg;
        }
      });
      return await runners[runnerName](...runnerArguments);
    }

    // 입력 argument 분리
    const funcArguments = (() => {
      if (filteredMatching.length === inputArgs.length) {
        return [];
      } else {
        // 입력 argument type coercing
        return inputArgs.slice(filteredMatching.length).map((value, index) => {
          const typeName = matching[
            filteredMatching.length + index
          ] as `#${string}`;
          const type = config.types[typeName];
          if (!type) {
            throw new Error(`Unknown type ${typeName}`);
          }

          if (type === "number") {
            return Number(value);
          } else if (type === "number[]") {
            return value.split(",").map((v) => Number(v));
          } else {
            return value;
          }
        });
      }
    })();

    // 실행
    await runners[runnerName](...funcArguments);
  } else {
    const choices = matchings.map((matching) => ({
      title: matching.join(" "),
      value: matching.join(" "),
    }));

    const response = await prompts({
      type: "autocomplete",
      name: "value",
      message: "Choose one-",
      suggest: async (input, choices: { title: string; value: string }[]) => {
        if (input === "") {
          return choices;
        }
        return findLikeFzf(input, choices, {
          selector: (item) => item.title,
        });
      },
      choices,
    });
    if (response.value === undefined) {
      return;
    }

    const newRawInputArgs = rawInputArgs
      .slice(0, argStartIndex)
      .concat(
        response.value
          .split(" ")
          .filter((elem: string) => elem.startsWith("#") === false)
      );
    return await tsicli(newRawInputArgs, config);
  }
}

function checkBelongs(
  types: TsicliRegister["types"],
  configArg: string[],
  argv: string[]
) {
  if (configArg.length < argv.length) {
    return false;
  }

  return argv.every((argvElement, index) => {
    if (configArg[index].startsWith("#")) {
      const type = types[configArg[index] as keyof typeof types];
      if (type === undefined) {
        throw new Error(`Unregistered type ${configArg[index]}`);
      } else if (type === "string") {
        return true;
      } else if (type === "number" && !Number.isNaN(Number(argvElement))) {
        return true;
      } else if (typeof type === "object") {
        const values = type.choices!.map((c) => c.value);
        return values.includes(argvElement);
      } else {
        throw new Error(`Unknown type ${configArg[index]}`);
      }
    }
    return configArg[index] === argvElement;
  });
}

export function findLikeFzf<T extends object>(
  term: string,
  array: T[],
  options?: { selector: (row: T) => string }
): T[] {
  const result = array.map((elem) => {
    const item = (options?.selector ? options.selector(elem) : elem) as string;
    if (typeof item !== "string") {
      throw new Error("Needs to selector option");
    }

    const termArray = term.split("");
    let prevIndex: number = -1;
    let matchingCount: number = 0;
    for (let char of termArray) {
      const index = item.indexOf(char, prevIndex);
      if (index === -1) {
        return {
          elem: elem,
          matchingCount,
        };
      }
      matchingCount++;
      prevIndex = index;
    }

    return {
      matchingCount,
      elem: elem,
    };
  });

  return result
    .filter((r) => r.matchingCount === term.length)
    .map((r) => r.elem);
}
