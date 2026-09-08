import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  InjectRepository,
} from '@nestjs/typeorm';

import {
  Repository,
} from 'typeorm';

import {
  UserEntity,
  UserRole,
} from './user.entity';

import {
  normalizeBdPhone,
} from '../common/utils/phone.util';

import {
  UpdateProfileDto,
} from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(
      UserEntity,
    )
    private readonly users:
      Repository<UserEntity>,
  ) {}

  /*
   * Remove private/internal fields
   * before returning a user object.
   */
  sanitize(
    user: UserEntity,
  ) {
    if (!user) {
      return null;
    }

    const {
      password,
      emailVerificationOtpHash,
      emailVerificationOtpExpiresAt,
      ...safe
    } = user as any;

    return safe;
  }

  async findById(
    id: number,
  ): Promise<UserEntity> {
    const user =
      await this.users.findOne({
        where: {
          id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    return user;
  }

  async findByIdWithPassword(
    id: number,
  ): Promise<UserEntity | null> {
    return this.users
      .createQueryBuilder(
        'user',
      )
      .addSelect(
        'user.password',
      )
      .where(
        'user.id = :id',
        {
          id,
        },
      )
      .getOne();
  }

  async findByIdentifierWithPassword(
    identifier: string,
  ): Promise<UserEntity | null> {
    const normalized =
      identifier.includes('@')
        ? identifier
            .trim()
            .toLowerCase()
        : normalizeBdPhone(
            identifier,
          );

    return this.users
      .createQueryBuilder(
        'user',
      )
      .addSelect(
        'user.password',
      )
      .where(
        'LOWER(user.email) = LOWER(:email)',
        {
          email:
            normalized,
        },
      )
      .orWhere(
        'user.phone = :phone',
        {
          phone:
            normalized,
        },
      )
      .getOne();
  }

  async assertUnique(
    email: string,
    phone?: string,
    ignoreUserId?: number,
  ) {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();

    const cleanPhone =
      phone
        ? normalizeBdPhone(
            phone,
          )
        : undefined;

    const emailUser =
      await this.users.findOne({
        where: {
          email:
            cleanEmail,
        },
      });

    if (
      emailUser &&
      emailUser.id !==
        ignoreUserId
    ) {
      throw new ConflictException(
        'Email is already registered',
      );
    }

    if (cleanPhone) {
      const phoneUser =
        await this.users.findOne({
          where: {
            phone:
              cleanPhone,
          },
        });

      if (
        phoneUser &&
        phoneUser.id !==
          ignoreUserId
      ) {
        throw new ConflictException(
          'Phone number is already registered',
        );
      }
    }
  }

  /*
   * ===========================
   * LOCAL REGISTRATION
   * ===========================
   */

  async createLocal(
    data: {
      fullName: string;
      email: string;
      phone: string;
      password: string;
      role?: UserRole;
    },
  ) {
    const email =
      data.email
        .trim()
        .toLowerCase();

    const phone =
      normalizeBdPhone(
        data.phone,
      );

    await this.assertUnique(
      email,
      phone,
    );

    const user =
      this.users.create({
        fullName:
          data.fullName.trim(),

        email,

        phone,

        password:
          data.password,

        role:
          data.role ??
          UserRole.CUSTOMER,
      });

    return this.users.save(
      user,
    );
  }

  /*
   * ===========================
   * GOOGLE AUTH
   * ===========================
   */

  async findOrCreateGoogle(
    profile: {
      googleId: string;
      email: string;
      fullName: string;
      photo?: string;
    },
  ) {
    const email =
      profile.email
        .trim()
        .toLowerCase();

    /*
     * 1. User already connected
     * to this Google account.
     */
    const byGoogle =
      await this.users.findOne({
        where: {
          googleId:
            profile.googleId,
        },
      });

    if (byGoogle) {
      let changed =
        false;

      /*
       * Google authentication means
       * this account does not need
       * NexaBazar OTP verification.
       */
      if (
        !byGoogle.emailVerified
      ) {
        byGoogle.emailVerified =
          true;

        byGoogle.emailVerificationOtpHash =
          null;

        byGoogle.emailVerificationOtpExpiresAt =
          null;

        changed =
          true;
      }

      /*
       * Add Google photo if the user
       * does not already have one.
       */
      if (
        !byGoogle.photo &&
        profile.photo
      ) {
        byGoogle.photo =
          profile.photo;

        changed =
          true;
      }

      if (changed) {
        return this.users.save(
          byGoogle,
        );
      }

      return byGoogle;
    }

    /*
     * 2. Same email already exists
     * as a local NexaBazar account.
     *
     * Link Google to that same user
     * instead of creating duplicate
     * accounts.
     */
    const byEmail =
      await this.users.findOne({
        where: {
          email,
        },
      });

    if (byEmail) {
      byEmail.googleId =
        profile.googleId;

      /*
       * Google login verifies the
       * account, so any outstanding
       * local OTP becomes unnecessary.
       */
      byEmail.emailVerified =
        true;

      byEmail.emailVerificationOtpHash =
        null;

      byEmail.emailVerificationOtpExpiresAt =
        null;

      if (
        !byEmail.photo &&
        profile.photo
      ) {
        byEmail.photo =
          profile.photo;
      }

      return this.users.save(
        byEmail,
      );
    }

    /*
     * 3. Completely new Google user.
     *
     * No password or phone is required.
     * Google-authenticated email is
     * treated as verified.
     */
    const user =
      this.users.create({
        googleId:
          profile.googleId,

        email,

        fullName:
          profile.fullName.trim(),

        photo:
          profile.photo ??
          null,

        phone:
          null,

        password:
          null,

        role:
          UserRole.CUSTOMER,

        emailVerified:
          true,

        emailVerificationOtpHash:
          null,

        emailVerificationOtpExpiresAt:
          null,
      });

    return this.users.save(
      user,
    );
  }

  /*
   * ===========================
   * PROFILE UPDATE
   * ===========================
   */

  async updateProfile(
    userId: number,
    dto: UpdateProfileDto,
  ) {
    const user =
      await this.findById(
        userId,
      );

    const nextEmail =
      dto.email
        ?.trim()
        .toLowerCase() ??
      user.email;

    const nextPhone =
      dto.phone
        ? normalizeBdPhone(
            dto.phone,
          )
        : user.phone;

    await this.assertUnique(
      nextEmail,
      nextPhone ??
        undefined,
      userId,
    );

    if (
      dto.fullName !==
      undefined
    ) {
      user.fullName =
        dto.fullName.trim();
    }

    if (
      dto.email !==
      undefined
    ) {
      user.email =
        nextEmail;
    }

    if (
      dto.phone !==
      undefined
    ) {
      user.phone =
        nextPhone;
    }

    if (
      dto.address !==
      undefined
    ) {
      user.address =
        dto.address.trim();
    }

    if (
      dto.city !==
      undefined
    ) {
      user.city =
        dto.city.trim();
    }

    if (
      dto.postcode !==
      undefined
    ) {
      user.postcode =
        dto.postcode;
    }

    return this.sanitize(
      await this.users.save(
        user,
      ),
    );
  }

  /*
   * ===========================
   * ADMIN ROLE
   * ===========================
   */

  async setRole(
    email: string,
    role: UserRole,
  ) {
    const user =
      await this.users.findOne({
        where: {
          email:
            email
              .trim()
              .toLowerCase(),
        },
      });

    if (!user) {
      throw new BadRequestException(
        'Cannot set role because user does not exist',
      );
    }

    user.role =
      role;

    return this.users.save(
      user,
    );
  }
}