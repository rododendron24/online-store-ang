export type CartType = {
  items: {
      product: {
        price: number,
        image: string,
        id: string,
        name: string,
        url: string,
      },
      quantity: number
    }[]
}
