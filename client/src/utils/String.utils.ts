export const isValidQueryParam = (
  ...data: (string | string[] | undefined)[]
) => {
  let hasError = false;
  data.forEach((item) => {
    if (!item || typeof item !== "string") {
      hasError = true;
    }
  });
  return !hasError;
};

export function capitalize(input: string) {
  return input.length > 0 ? input[0].toUpperCase() + input.slice(1) : "";
}

export function normalizeString(input: string) {
  return input
    .trim()
    .split(" ")
    .map((w) => capitalize(w))
    .join("")
    .split("-")
    .map((w) => capitalize(w))
    .join("");
  //   return capitalize(input).replace(" ", "_").replace("-", "_");
}

export const bufferTohex = (buf: Buffer) => `0x${buf.toString("hex")}`;

export const getSaleConfigFromResponse = (data: { [x: string]: any }) => ({
  status: data["status"],
  startTime: +data["startTime"].toString(),
  endTime: +data["endTime"].toString(),
});

export const get721MintEventArgsMapping = (data: { [x: string]: any }) => ({
  msgSender: data["msgSender"].toString(),
  fromTokenId: +data["fromTokenId"].toString(),
  toTokenId: +data["toTokenId"].toString(),
});

function forceTwo(inp: number) {
  return inp.toString().padStart(2, "0");
}

export function formatHtmlDateTime(datetime: Date) {
  return `${datetime.getFullYear()}-${forceTwo(
    datetime.getMonth() + 1
  )}-${forceTwo(datetime.getDate())}T${forceTwo(
    datetime.getHours()
  )}:${forceTwo(datetime.getMinutes())}`;
}

export const getUrlFileExtension = (url: string) => {
  return new URL(url).pathname.substring(
    new URL(url).pathname.lastIndexOf(".") + 1
  );
};
