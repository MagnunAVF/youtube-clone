import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';
import { SignupDto } from './dto/signup.dto';
import { AuthResponse } from './interfaces/auth-response.interface';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const email = signupDto.email.toLowerCase();

    const existing = await this.usersService.findByEmail(email);
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(signupDto.password, SALT_ROUNDS);
    const user = await this.usersService.createWithCredentials({
      displayName: signupDto.displayName,
      email,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  private buildAuthResponse(user: UserDocument): AuthResponse {
    const id = user._id.toString();
    return {
      accessToken: this.jwtService.sign({ sub: id }),
      user: {
        id,
        displayName: user.displayName,
        email: user.email ?? '',
      },
    };
  }
}
