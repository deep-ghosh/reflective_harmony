interface DBConnectOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
interface driver {
  name: "postgres" | "sqlite" | null;
}

export type { DBConnectOptions, driver };
