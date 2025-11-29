const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

async function fetchUser(): Promise<string> {
  await delay(500);
  return "User";
}

async function fetchOrders(): Promise<string[]> {
  await delay(500);
  return ["Order-1", "Order-2"];
}

async function sequential() {
  console.time("sequential");
  const user = await fetchUser();
  const orders = await fetchOrders();
  console.timeEnd("sequential");
  console.log({ user, orders });
}

async function parallel() {
  console.time("parallel");
  const [user, orders] = await Promise.all([fetchUser(), fetchOrders()]);
  console.timeEnd("parallel");
  console.log({ user, orders });
}

sequential().then(parallel);
