import dayjs from "dayjs";

export default {
  difference: (first: string, second: string): number => {
    return dayjs(first).diff(second);
  }
};
