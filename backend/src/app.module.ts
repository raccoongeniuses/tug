import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppConfigModule } from './config/config.module';
import { typeOrmConfig } from './config/typeorm.config';
import { PackagesModule } from './packages/packages.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => typeOrmConfig(config),
    }),
    PackagesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
