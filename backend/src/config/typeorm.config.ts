import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST'),
  port: Number(config.get<string | number>('DB_PORT') ?? 3306),
  username: config.get<string>('DB_USER'),
  password: config.get<string>('DB_PASSWORD') ?? '',
  database: config.get<string>('DB_NAME'),
  autoLoadEntities: true,
  synchronize: config.get<string>('NODE_ENV') !== 'production',
  charset: 'utf8mb4',
  extra: { decimalNumbers: true },
});
