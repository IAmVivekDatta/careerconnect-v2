declare module 'node-fetch' {
  function fetch(input: string, init?: any): Promise<any>;
  export default fetch;
}
