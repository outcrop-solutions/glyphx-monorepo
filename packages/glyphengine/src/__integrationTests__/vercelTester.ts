import simpleGit from 'simple-git';

class VercelDeploymentTester {
  private branch;
  private startDate;
  private endDate;
  private vercelApiToken;
  private vercelProjectId;
  private authToken;
  private git;

  constructor(branch, startDate, endDate, vercelApiToken, vercelProjectId, authToken) {
    this.branch = branch;
    this.startDate = startDate;
    this.endDate = endDate;
    this.vercelApiToken = vercelApiToken;
    this.vercelProjectId = vercelProjectId;
    this.authToken = authToken;
    this.git = simpleGit();
  }

  public async runPipeline() {
    const commitIds = await this.getCommitsInRange();

    for (const commitId of commitIds) {
      const deploymentUrl = await this.getVercelDeploymentUrl(commitId);
      console.log('Vercel Deployment URL:', deploymentUrl);

      if (deploymentUrl) {
        const apiEndpoint = await this.findServerActionEndpoint(deploymentUrl);
        console.log('API Endpoint:', apiEndpoint);

        if (apiEndpoint) {
          await this.sendAuthenticatedRequest(apiEndpoint);
        }
      }
    }
  }

  private async getCommitsInRange() {
    try {
      const log = await this.git.log({
        from: this.startDate,
        to: this.endDate,
        '--first-parent': null,
        '--merges': null,
        '--format': '%H',
        [`origin/${this.branch}`]: null,
      });
      return log.all.map((commit) => commit.hash);
    } catch (error) {
      console.error('Error fetching git commits:', error);
      return [];
    }
  }

  private async getVercelDeploymentUrl(commitId) {
    try {
      const response = await fetch(`https://api.vercel.com/v6/deployments?projectId=${this.vercelProjectId}`, {
        headers: {
          Authorization: `Bearer ${this.vercelApiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch deployments');
      }

      const data = await response.json();
      const deployments = data?.deployments;
      const deployment = deployments.find((deployment) => deployment.meta.githubCommitSha === commitId);

      if (deployment) {
        return deployment.url;
      } else {
        console.error('Deployment not found for the provided commit ID');
        return null;
      }
    } catch (error) {
      console.error('Error fetching deployments:', error);
      return null;
    }
  }

  private async findServerActionEndpoint(deploymentUrl) {
    try {
      const response = await fetch(
        `https://api.vercel.com/v6/deployments/${this.vercelProjectId}/logs?url=${deploymentUrl}`,
        {
          headers: {
            Authorization: `Bearer ${this.vercelApiToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch deployment logs');
      }

      const data = await response.json();
      const logs = data.logs;
      const endpointMatch = logs.match(/POST \/api\/.*? \d{3}/);

      if (endpointMatch) {
        const endpoint = endpointMatch[0].split(' ')[1];
        return `${deploymentUrl}${endpoint}`;
      } else {
        console.error('API endpoint not found in deployment logs');
        return null;
      }
    } catch (error) {
      console.error('Error fetching deployment logs:', error);
      return null;
    }
  }

  private async sendAuthenticatedRequest(apiEndpoint) {
    if (!apiEndpoint) {
      console.error('No API endpoint provided');
      return;
    }

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send API request');
      }

      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('Error sending API request:', error);
    }
  }
}

const branch = 'git_branch';
const startDate = '2023-01-01';
const endDate = '2023-12-31';
const vercelApiToken = 'vercel_api_token';
const vercelProjectId = 'vercel_project_id';
const authToken = 'auth_token';

const tester = new VercelDeploymentTester(branch, startDate, endDate, vercelApiToken, vercelProjectId, authToken);
tester.runPipeline();
