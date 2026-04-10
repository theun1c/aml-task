import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';

// ### `POST /auth/register`
// Request:
// ```json
// {
//   "email": "user@example.com",
//   "password": "strongPass123",
//   "name": "Alex"
// }
// ```
// Response `201`:
// ```json
// {
//   "accessToken": "<jwt>",
//   "refreshToken": "<jwt>",
//   "user": {
//     "id": "uuid",
//     "email": "user@example.com",
//     "name": "Alex"
//   }
// }
// ```

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  

  async register(dto: RegisterDto) {
    
  }
}
