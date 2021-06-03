import { Service } from 'typedi';

import BaseService from '../services/BaseService';
import { Organisation } from '../models/Organisation';

@Service()
export default class OrganisationService extends BaseService<Organisation> {
  modelName(): string {
    return Organisation.name;
  }

  public async findByUniquekey(organisationUniquekey: string): Promise<number> {
    let query = this.entityManager.createQueryBuilder(Organisation, 'organisation');
    query.where('organisation.organisationUniquekey= :organisationUniquekey and isDeleted = 0', {
      organisationUniquekey,
    });
    return (await query.getOne()).id;
  }

  public async findOrgByUniquekey(organisationUniquekey: string): Promise<Organisation> {
    let query = this.entityManager.createQueryBuilder(Organisation, 'organisation');
    query.where('organisation.organisationUniquekey= :organisationUniquekey and isDeleted = 0', {
      organisationUniquekey,
    });
    return await query.getOne();
  }

  public async organisation(organisationUniqueKey: string) {
    try {
      let result = await this.entityManager.query('call `wsa_users`.`usp_get_organisations`(?)', [
        organisationUniqueKey,
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  public async userOrganisation(userId) {
    try {
      let result = await this.entityManager.query('call wsa_users.usp_user_organisation(?)', [
        userId,
      ]);
      return result[0];
    } catch (error) {
      throw error;
    }
  }

  public async findAffiliatedToOrg(organisationId) {
    try {
      let result = await this.entityManager.query(
        `SELECT a.affiliatedToOrgId FROM wsa_users.affiliate a where a.affiliateOrgId = ? and a.isDeleted = 0`,
        [organisationId],
      );

      let res = result.find(x => x);

      return res.affiliatedToOrgId;
    } catch (error) {
      throw error;
    }
  }

  public async getAllOrganisations(): Promise<Organisation[]> {
    let query = this.entityManager.createQueryBuilder(Organisation, 'o');
    query.select(['o.organisationUniqueKey', 'o.organisationTypeRefId', 'o.name']);
    query.where('o.isDeleted = 0');
    return await query.getMany();
  }

  public async addStripeCustomerId(id: number, customerId: string) {
    await this.entityManager.query(
      `update wsa_users.organisation 
        set stripeCustomerAccountId = ? 
        where id = ?`,
      [customerId, id],
    );
  }

  public async addBecsId(id: number, becsId: string) {
    await this.entityManager.query(
      `update wsa_users.organisation 
        set stripeBecsMandateId = ? 
        where id = ?`,
      [becsId, id],
    );
  }

  public async getOrganisationByName(name: string) {
    let result = await this.entityManager.query(
      `select o.name, o.id, o.organisationTypeRefId, o.suburb, o.postalCode, oState.name as state,
        json_object('name', p.name, 'id', p.id, 'suburb', p.suburb, 'state', pState.name, 'postalCode', p.postalCode) parent 
        from wsa_users.organisation o
        inner join wsa_users.affiliate a on a.affiliateOrgId = o.id
        inner join wsa_users.organisation p on a.affiliatedToOrgId = p.id
        left join wsa_common.reference oState on o.stateRefId = oState.id and oState.referenceGroupId = 37
        left join wsa_common.reference pState on p.stateRefId = pState.id and pState.referenceGroupId = 37
        where o.isDeleted = 0 and o.organisationTypeRefId != 1 ${
          name === '' ? '' : 'and lower(o.name) like lower(?)'
        }
        order by o.name asc`,
      [`%${name}%`],
    );
    return result;
  }

  public async getAffiliatedOrganisations(organisationIds: number[], level: number) {
    try {
      const affiliatesOrganisations = await this.entityManager.query(
        `select * from wsa_users.organisationHierarchy 
            where organisationHierarchy.inputOrganisationId in (?)
            AND organisationHierarchy.linkedOrganisationTypeRefId = ?`,
        [organisationIds, level],
      );

      let organisations = [];
      if (affiliatesOrganisations) {
        organisations = affiliatesOrganisations.map(org => org.linkedOrganisationId);
      }
      return organisations;
    } catch (err) {
      throw err;
    }
  }
}
