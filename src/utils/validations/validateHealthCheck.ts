
export const validateEnum = async (value: string, enumToCheck: any) => {
  return enumToCheck.includes(value);
};
