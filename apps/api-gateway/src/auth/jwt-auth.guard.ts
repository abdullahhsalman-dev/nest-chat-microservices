import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// The @Injectable() decorator makes it a provider that can be injected into other components.
// by using injectable we can make object in other classes.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
