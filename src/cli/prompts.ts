import prompts from "prompts";

export async function confirmOverwrite(filePath: string): Promise<boolean> {
  const response = await prompts({
    type: "confirm",
    name: "ok",
    message: `${filePath} already exists. Overwrite?`,
    initial: false,
  });
  return Boolean(response.ok);
}
