// MongoDB module temporarily disabled due to mongoose dependency removal
// To enable MongoDB support, install @nestjs/mongoose and mongoose packages

// import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
// import { ConfigModule, ConfigService } from '@nestjs/config';

// @Module({
//   imports: [
//     MongooseModule.forRootAsync({
//       imports: [ConfigModule],
//       inject: [ConfigService],
//       useFactory: (configService: ConfigService) => ({
//         uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/nestjs_practice'),
//       }),
//     }),
//   ],
//   exports: [MongooseModule],
// })
// export class MongoModule {}

// Placeholder module for now
import { Module } from '@nestjs/common';

@Module({})
export class MongoModule {}