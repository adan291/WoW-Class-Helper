/**
 * GDPR Service
 * Manages GDPR compliance and data export
 */

export interface UserDataExport {
  userId: string;
  email: string;
  username: string;
  createdAt: number;
  profile: Record<string, any>;
  guides: Record<string, any>[];
  comments: Record<string, any>[];
  bookmarks: Record<string, any>[];
  preferences: Record<string, any>;
  activityLog: Record<string, any>[];
}

export interface ConsentRecord {
  userId: string;
  consentType: 'marketing' | 'analytics' | 'cookies' | 'data_processing';
  granted: boolean;
  timestamp: number;
  ipAddress?: string;
}

class GDPRService {
  private readonly CONSENT_KEY = 'wow_class_helper_consent_records';
  private readonly DELETION_KEY = 'wow_class_helper_deletion_requests';

  /**
   * Get user consent
   */
  getUserConsent(userId: string, consentType: ConsentRecord['consentType']): boolean {
    try {
      const data = localStorage.getItem(this.CONSENT_KEY);
      if (!data) return false;

      const records: ConsentRecord[] = JSON.parse(data);
      const record = records.find((r) => r.userId === userId && r.consentType === consentType);

      return record?.granted || false;
    } catch {
      return false;
    }
  }

  /**
   * Set user consent
   */
  setUserConsent(
    userId: string,
    consentType: ConsentRecord['consentType'],
    granted: boolean
  ): void {
    try {
      const data = localStorage.getItem(this.CONSENT_KEY);
      const records: ConsentRecord[] = data ? JSON.parse(data) : [];

      // Remove existing record
      const filtered = records.filter(
        (r) => !(r.userId === userId && r.consentType === consentType)
      );

      // Add new record
      filtered.push({
        userId,
        consentType,
        granted,
        timestamp: Date.now(),
        ipAddress: 'unknown',
      });

      localStorage.setItem(this.CONSENT_KEY, JSON.stringify(filtered));
    } catch {
      console.error('Failed to set consent');
    }
  }

  /**
   * Export user data
   */
  exportUserData(userId: string): UserDataExport | null {
    try {
      // In real implementation, this would fetch from database
      const userData: UserDataExport = {
        userId,
        email: 'user@example.com',
        username: 'username',
        createdAt: Date.now(),
        profile: {},
        guides: [],
        comments: [],
        bookmarks: [],
        preferences: {},
        activityLog: [],
      };

      return userData;
    } catch {
      return null;
    }
  }

  /**
   * Export user data as JSON
   */
  exportUserDataAsJSON(userId: string): string | null {
    const userData = this.exportUserData(userId);
    if (!userData) return null;

    return JSON.stringify(userData, null, 2);
  }

  /**
   * Request data deletion
   */
  requestDataDeletion(userId: string, reason?: string): boolean {
    try {
      const data = localStorage.getItem(this.DELETION_KEY);
      const requests: Array<{ userId: string; requestedAt: number; reason?: string }> = data
        ? JSON.parse(data)
        : [];

      // Check if already requested
      if (requests.some((r) => r.userId === userId)) {
        return false;
      }

      requests.push({
        userId,
        requestedAt: Date.now(),
        reason,
      });

      localStorage.setItem(this.DELETION_KEY, JSON.stringify(requests));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get deletion requests
   */
  getDeletionRequests(): Array<{ userId: string; requestedAt: number; reason?: string }> {
    try {
      const data = localStorage.getItem(this.DELETION_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Process deletion request
   */
  processDeletionRequest(userId: string): boolean {
    try {
      const data = localStorage.getItem(this.DELETION_KEY);
      if (!data) return false;

      const requests: Array<{ userId: string; requestedAt: number; reason?: string }> =
        JSON.parse(data);
      const filtered = requests.filter((r) => r.userId !== userId);

      localStorage.setItem(this.DELETION_KEY, JSON.stringify(filtered));

      // In real implementation, delete all user data from database
      console.log(`User ${userId} data deletion processed`);

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get GDPR compliance status
   */
  getComplianceStatus(userId: string): {
    hasConsent: boolean;
    consentTypes: Record<string, boolean>;
    dataExportable: boolean;
    deletionRequested: boolean;
  } {
    const consentTypes = {
      marketing: this.getUserConsent(userId, 'marketing'),
      analytics: this.getUserConsent(userId, 'analytics'),
      cookies: this.getUserConsent(userId, 'cookies'),
      data_processing: this.getUserConsent(userId, 'data_processing'),
    };

    const deletionRequests = this.getDeletionRequests();
    const deletionRequested = deletionRequests.some((r) => r.userId === userId);

    return {
      hasConsent: Object.values(consentTypes).some((v) => v),
      consentTypes,
      dataExportable: true,
      deletionRequested,
    };
  }

  /**
   * Get privacy policy
   */
  getPrivacyPolicy(): string {
    return `
# Privacy Policy

## Data Collection
We collect personal data necessary to provide our services.

## Data Usage
Your data is used to improve our services and provide personalized experiences.

## Data Protection
We implement industry-standard security measures to protect your data.

## Your Rights
- Right to access your data
- Right to export your data
- Right to delete your data
- Right to withdraw consent

## Contact
For privacy concerns, contact: privacy@example.com
    `.trim();
  }

  /**
   * Get terms of service
   */
  getTermsOfService(): string {
    return `
# Terms of Service

## Acceptance
By using our service, you accept these terms.

## User Responsibilities
- You are responsible for maintaining account security
- You agree not to violate any laws
- You agree not to post harmful content

## Limitation of Liability
We are not liable for indirect or consequential damages.

## Changes to Terms
We may update these terms at any time.

## Governing Law
These terms are governed by applicable law.
    `.trim();
  }

  /**
   * Get consent records
   */
  getConsentRecords(userId: string): ConsentRecord[] {
    try {
      const data = localStorage.getItem(this.CONSENT_KEY);
      if (!data) return [];

      const records: ConsentRecord[] = JSON.parse(data);
      return records.filter((r) => r.userId === userId);
    } catch {
      return [];
    }
  }

  /**
   * Export compliance report
   */
  exportComplianceReport(userId: string): string {
    const status = this.getComplianceStatus(userId);
    const consentRecords = this.getConsentRecords(userId);

    return JSON.stringify(
      {
        userId,
        generatedAt: new Date().toISOString(),
        complianceStatus: status,
        consentRecords,
        privacyPolicy: this.getPrivacyPolicy(),
        termsOfService: this.getTermsOfService(),
      },
      null,
      2
    );
  }
}

export const gdprService = new GDPRService();
