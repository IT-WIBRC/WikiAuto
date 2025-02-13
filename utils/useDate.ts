import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export default {
  difference: (first: string, second: string): number => {
    return dayjs(first).diff(second);
  },
  format: (date: string | Date): string => {
    return dayjs(date).utc(true).local().format("YYYY/MM/DD HH:mm:ss");
  },
};
