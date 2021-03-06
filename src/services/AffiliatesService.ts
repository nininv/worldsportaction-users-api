import { Service } from 'typedi';
import BaseService from '../services/BaseService';
import { Affiliate } from '../models/Affiliate';
import { logger } from '../logger';
import { isArrayPopulated, paginationData, stringTONumber } from '../utils/Utils';

@Service()
export default class AffiliateService extends BaseService<Affiliate> {
  modelName(): string {
    return Affiliate.name;
  }

  public async affiliatesByOrgId(affiliatedToOrgId) {
    try {
      let query = this.entityManager
        .createQueryBuilder(Affiliate, 'affiliate')
        .where('affiliate.affiliatedToOrgId = :affiliatedToOrgId', { affiliatedToOrgId });
      return query.getMany();
    } catch (err) {
      console.log('err  :::: ', err);
    }
  }

  public async affiliatesList(
    requestFilter: any,
    sortBy: string = undefined,
    sortOrder: 'ASC' | 'DESC' = undefined,
  ) {
    try {
      let searchText = requestFilter.searchText;
      let organisationId = requestFilter.organisationId;
      let affiliatedToOrgId = requestFilter.affiliatedToOrgId;
      let organisationTypeRefId = requestFilter.organisationTypeRefId;
      let statusRefId = requestFilter.statusRefId;
      let limit = requestFilter.paging.limit;
      let offset = requestFilter.paging.offset;

      let affiliateArray = [];

      let result = await this.entityManager.query(
        'call wsa_users.usp_affiliates_list(?,?,?,?,?,?,?,?,?)',
        [
          organisationId,
          affiliatedToOrgId,
          organisationTypeRefId,
          statusRefId,
          limit,
          offset,
          sortBy,
          sortOrder,
          searchText,
        ],
      );

      if (result != null) {
        let totalCount = result[1].find(x => x).totalCount;
        let responseObject = paginationData(stringTONumber(totalCount), limit, offset);

        if (requestFilter.stateOrganisations === true) {
          responseObject['affiliates'] = result[3];
          delete responseObject['page'];
        } else {
          for (let affiliates of result[2]) {
            let contacts = result[0];
            let contact1Name = '';
            let contact2Name = ';';
            if (contacts != null && contacts.length > 0) {
              const filterContact = contacts.filter(
                x => x.affiliateOrgId == affiliates.affiliateOrgId,
              );
              console.log('***' + JSON.stringify(filterContact));
              if (filterContact != null && filterContact.length > 0) {
                contact1Name = filterContact[0].firstName;
                contact2Name = filterContact[1] != null ? filterContact[1].firstName : '';
              }
            }
            let affiliatesObj = {
              affiliateId: affiliates.affiliateId,
              affiliatedToOrgId: affiliates.affiliatedToOrgId,
              affiliateOrgId: affiliates.affiliateOrgId,
              affiliateName: affiliates.affiliateName,
              affiliatedToName: affiliates.affiliatedToName,
              organisationTypeRefName: affiliates.organisationTypeRefName,
              contact1Name: contact1Name,
              contact2Name: contact2Name,
              isUsed: false,
              key: affiliates.affiliateOrgId.toString(),
              statusRefName: affiliates.statusRefName,
              organisationTypeRefId: affiliates.organisationTypeRefId,
            };
            affiliateArray.push(affiliatesObj);
          }
          responseObject['affiliates'] = affiliateArray;
        }
        return responseObject;
      } else {
        return [];
      }
    } catch (err) {
      console.log('err  :::: ', err);
    }
  }

  public async affiliate(organisationId: any) {
    let result = await this.entityManager.query('call wsa_users.usp_affiliate(?)', [
      organisationId,
    ]);
    let res = result[0];

    if (res != null) {
      let affMap = new Map();
      let contactMap = new Map();
      let affiliateObj;
      for (let aff of res) {
        let affTemp = affMap.get(aff.affiliateId);
        let contactTemp = contactMap.get(aff.userId);
        let permissionObj = {
          userRoleEntityId: aff.userRoleEntityId,
          roleId: aff.roleId,
        };

        let contactsObj = {
          userId: aff.userId,
          firstName: aff.firstName,
          middleName: aff.middleName,
          lastName: aff.lastName,
          mobileNumber: aff.mobileNumber,
          email: aff.email != null ? aff.email.toLowerCase() : null,
          permissions: [],
        };
        if (affTemp == undefined) {
          affiliateObj = {
            affiliateId: aff.affiliateId,
            organisationTypeRefId: aff.organisationTypeRefId,
            affiliatedToOrgId: aff.affiliatedToOrgId,
            affiliatedToOrgName: aff.affiliatedToOrgName,
            affiliateOrgId: aff.affiliateOrgId,
            name: aff.affiliateOrgName,
            organisationTypeRefName: aff.organisationTypeRefName,
            phoneNo: aff.phoneNo,
            email: aff.affiliateMail,
            street1: aff.street1,
            street2: aff.street2,
            suburb: aff.suburb,
            city: aff.city,
            postalCode: aff.postalCode,
            stateRefId: aff.stateRefId,
            organisationLogoId: aff.organisationLogoId,
            logoUrl: aff.logoUrl,
            logoIsDefault: aff.logoIsDefault,
            organisationLogo: '',
            organisationPhotos: JSON.parse(aff.organisationPhotos),
            whatIsTheLowestOrgThatCanAddChild: aff.whatIsTheLowestOrgThatCanAddChild,
            termsAndConditionsRefId: aff.termsAndConditionsRefId,
            termsAndConditions: aff.termsAndConditions,
            termsAndConditionsLink:
              aff.termsAndConditionsRefId == 1 ? aff.termsAndConditions : null,
            termsAndConditionsFile:
              aff.termsAndConditionsRefId == 2 ? aff.termsAndConditions : null,
            stateTermsAndConditionsRefId: aff.stateTermsAndConditionsRefId,
            stateTermsAndConditions: aff.stateTermsAndConditions,
            stateTermsAndConditionsLink:
              aff.stateTermsAndConditionsRefId == 1 ? aff.stateTermsAndConditions : null,
            stateTermsAndConditionsFile:
              aff.stateTermsAndConditionsRefId == 2 ? aff.stateTermsAndConditions : null,
            contacts: [],
            charityRoundUp: [],
            charity: [],
          };

          if (aff.charityRoundUp != null) {
            affiliateObj.charityRoundUp = JSON.parse(aff.charityRoundUp);
          } else {
            let obj = {
              id: 0,
              charityRoundUpRefId: null,
            };
            affiliateObj.charityRoundUp.push(obj);
          }

          if (aff.charity != null) {
            affiliateObj.charity = JSON.parse(aff.charity);
          } else {
            let obj = {
              id: 0,
              title: '',
              description: '',
            };
            affiliateObj.charity.push(obj);
          }

          contactsObj.permissions.push(permissionObj);
          if (aff.userId != null) {
            affiliateObj.contacts.push(contactsObj);
            contactMap.set(aff.userId, contactsObj);
          }
          affMap.set(aff.affiliateId, affiliateObj);
        } else {
          if (contactTemp == undefined) {
            if (aff.userId != null) {
              contactsObj.permissions.push(permissionObj);
              contactMap.set(aff.userId, contactsObj);
              affTemp.contacts.push(contactsObj);
            }
          } else {
            if (aff.userRoleEntityId != null) contactTemp.permissions.push(permissionObj);
          }
        }
      }
      return affiliateObj;
    } else {
      console.log('Empty Result......');
    }
  }

  public async affiliateToOrg(organisationId: any, search: string = undefined) {
    console.log('organisationId::' + organisationId);
    let result = await this.entityManager.query('call wsa_users.usp_affiliateToOrg(?,?)', [
      organisationId,
      search,
    ]);

    let obj = {
      affiliatedTo: [...result[1], ...result[2], ...result[3]],
      organisationTypes: result[4],
      status: result[5],
      organisationName: result[0].find(x => x).name,
      organisationTypeRefId: result[0].find(x => x).organisationTypeRefId,
      isEligibleToAddAffiliate: Number(result[0].find(x => x).isEligibleToAddAffiliate),
      whatIsTheLowestOrgThatCanAddChild: Number(
        result[0].find(x => x).whatIsTheLowestOrgThatCanAddChild,
      ),
    };

    return obj;
  }

  public async affiliatesDelete(requestBody: any, userId: number) {
    try {
      let affiliateId = requestBody.affiliateId;

      let contacts = await this.entityManager.query(
        `SELECT userId from wsa_users.userRoleEntity ure 
                inner join wsa_users.affiliate a
                    on a.affiliateOrgId = ure.entityId and a.isDeleted =0
                where a.id = ?`,
        [affiliateId],
      );

      let deleteUserRoleEntity = await this.entityManager.query(
        ` UPDATE wsa_users.userRoleEntity ure
                inner join wsa_users.affiliate a
                    on a.affiliateOrgId = ure.entityId and a.isDeleted =0
                set ure.isDeleted = 1
                where a.id = ? and ure.entityTypeId = 2`,
        [affiliateId],
      );

      let contactsOtherAffiliateExists = null;
      let exists = null;
      if (isArrayPopulated(contacts)) {
        for (let c of contacts) {
          contactsOtherAffiliateExists = await this.entityManager.query(
            `SELECT * from wsa_users.userRoleEntity ure 
                            where ure.userId = ? and ure.entityId != ? 
                            and ure.entityTypeId = 2 and ure.isDeleted = 0`,
            [c.userId, affiliateId],
          );
          // exists.push(contactsOtherAffiliateExists)
          if (isArrayPopulated(contactsOtherAffiliateExists)) {
            exists = 1;
            break;
          }
        }
      }
      if (exists == null) {
        if (isArrayPopulated(contacts)) {
          for (let c of contacts) {
            let deleteUser = await this.entityManager.query(
              ` UPDATE wsa_users.user u
                                set u.isDeleted = 1
                                where id = ?`,
              [c.userId],
            );
          }
        }
      }
      await this.entityManager
        .createQueryBuilder(Affiliate, 'affiliate')
        .update(Affiliate)
        .set({ isDeleted: 1, updatedBy: userId, updatedOn: new Date() })
        .andWhere('id = :id', { id: affiliateId })
        .execute();
    } catch (error) {
      console.log('-------------ERROR:;');
      throw error;
    }
  }

  public async affiliateDirectory(
    requestFilter: any,
    sortBy: string = undefined,
    sortOrder: 'ASC' | 'DESC' = undefined,
  ) {
    try {
      let organisationId = requestFilter.organisationUniqueKey;
      let yearRefId = requestFilter.yearRefId;
      let organisationTypeRefId = requestFilter.organisationTypeRefId;
      let searchText = requestFilter.searchText;
      let limit = requestFilter.paging.limit;
      let offset = requestFilter.paging.offset;

      let affiliateArray = [];

      let result = await this.entityManager.query(
        'call wsa_users.usp_affiliate_directory(?,?,?,?,?,?,?,?,?)',
        [
          organisationId,
          yearRefId,
          organisationTypeRefId,
          searchText,
          limit,
          offset,
          1,
          sortBy,
          sortOrder,
        ],
      );

      if (result != null) {
        let totalCount = result[1].find(x => x).totalCount;
        let responseObject = paginationData(stringTONumber(totalCount), limit, offset);

        if (isArrayPopulated(result[0])) {
          let orgMap = new Map();
          let compMap = new Map();
          for (let item of result[0]) {
            let key = item.affiliateOrgId + '#' + item.affiliatedToOrg;
            let compKey = key + '#' + item.competitionId;
            let orgTemp = orgMap.get(key);
            let compTemp = compMap.get(compKey);
            let compObj = {
              competitionId: item.competitionId,
              competitionName: item.competitionName,
            };
            if (orgTemp == undefined) {
              let obj = {
                affiliateOrgId: item.affiliateOrgId,
                affiliateName: item.affiliateName,
                affiliatedToOrg: item.affiliatedToOrg,
                affiliatedToName: item.affiliatedToName,
                organisationTypeName: item.organisationTypeName,
                organisationTypeRefId: item.organisationTypeRefId,
                suburb: item.suburb,
                postalCode: item.postalCode,
                isEditable: item.isEditable,
                competitions: [],
              };

              if (item.competitionId != null) {
                obj.competitions.push(compObj);
                compMap.set(compKey, compObj);
              }
              affiliateArray.push(obj);
              orgMap.set(key, obj);
            } else {
              if (compTemp == undefined) {
                if (item.competitionId != null) {
                  orgTemp.competitions.push(compObj);
                  compMap.set(compKey, compObj);
                }
              }
            }
          }
        }

        responseObject['affiliates'] = affiliateArray;
        responseObject['organisationTypes'] = result[2];
        return responseObject;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }

  public async exportAffiliateDirectory(requestFilter: any, userId) {
    try {
      let organisationId = requestFilter.organisationUniqueKey;
      let yearRefId = requestFilter.yearRefId;
      let organisationTypeRefId = requestFilter.organisationTypeRefId;
      let searchText = requestFilter.searchText;

      let affiliateArray = [];

      let result = await this.entityManager.query(
        'call wsa_users.usp_export_affiliate_directory(?,?,?,?)',
        [organisationId, yearRefId, organisationTypeRefId, searchText],
      );

      if (result != null) {
        if (isArrayPopulated(result[0])) {
          result[0].forEach(r => {
            let obj = {};
            obj['Affiliate Name'] = r.affiliateName;
            obj['Organisation Type'] = r.organisationTypeName;
            obj['Affiliated To'] = r.affiliatedToName;
            obj['Competition'] = r.competitionName;
            obj['Suburb'] = r.suburb;
            obj['Postcode'] = r.postalCode;

            affiliateArray.push(obj);
          });
        } else {
          let obj = {
            'Affiliate Name': '',
            'Organisation Type': '',
            'Affiliated To': '',
            Competition: '',
            Suburb: '',
            Postcode: '',
          };
          affiliateArray.push(obj);
        }

        return affiliateArray;
      } else {
        return [];
      }
    } catch (error) {
      throw error;
    }
  }
}
