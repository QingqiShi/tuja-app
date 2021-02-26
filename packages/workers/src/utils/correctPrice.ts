export const correctPrice = (
  price: number,
  correction: {
    above: number;
    factor: number;
  }
): number => {
  if (price > correction.above) {
    return price * correction.factor;
  }
  return price;
};
