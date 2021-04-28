import BaseService from './BaseService';
import { Organisation } from '../models/Organisation';
import { User } from '../models/User';
import { TCUserAcknowledgement } from '../models/TCUserAcknowledgement';
import { UserRoleEntity } from '../models/security/UserRoleEntity';

export default class TermsAndConditionsAcknowledgementService extends BaseService<TCUserAcknowledgement> {
  modelName(): string {
    return TCUserAcknowledgement.name;
  }

  public createUserTCAcknowledgment(organisation, user) {
    const tc = new TCUserAcknowledgement();
    tc.organisation = organisation;
    tc.user = user;
    return tc;
  }

  async findByOrganisationId(organisationId: number): Promise<TCUserAcknowledgement[]> {
    return this.entityManager.find(TCUserAcknowledgement, {
      where: {
        organisationId: organisationId,
      },
    });
  }

  async createForOrganisation(
    organisationId: number,
    body: TCUserAcknowledgement,
  ): Promise<TCUserAcknowledgement> {
    body.organisation = await this.entityManager.findOneOrFail(Organisation, organisationId);
    return this.createOrUpdate(body);
  }

  async getAcknowledgementListForUser(user: User): Promise<any> {
    const organisationsHierarchy = await this.entityManager
      .createQueryBuilder(UserRoleEntity, 'ure')
      .leftJoin(
        'all_organisations_hierarchy',
        'lo',
        'ure.entityId = lo.o4id and ure.entityTypeId = 2',
      )
      .leftJoin('role', 'r', 'ure.roleId = r.id')
      .innerJoin('tcUserAcknowledgement', 'tc', 'tc.organisationId = ure.entityId')
      .where('ure.userId = :userId', { userId: user.id })
      .andWhere('tc.userId = :userId', { userId: user.id })
      .andWhere('r.applicableToWeb = 1')
      .getMany();

    return organisationsHierarchy.map(item => item.entityId);
  }

  async saveUserAcknowledge(user: User, organisation: Organisation) {
    const newUserTC = this.createUserTCAcknowledgment(organisation, user);

    await this.createOrUpdate(newUserTC);
  }
}
