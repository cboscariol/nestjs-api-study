import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto) {
    //generate de password hash
    const hash = await argon.hash(dto.password);
    //save the new user in the db
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
      });

      delete user.hash;
      //return the saved user
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        // check is the error is a prisma error
        if (error.code === 'P2002') {
          //prisma error about duplications, garantee we don't have to users with same email
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error; // if its a regular error
    }
  }

  async signin(dto: AuthDto) {
    //find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    //if user doesent exist trhow exeption
    if (!user) throw new ForbiddenException('Credentials incorrect');
    //compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    //if password dont match trhow exeption
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    delete user.hash;
    return user;
  }
}
