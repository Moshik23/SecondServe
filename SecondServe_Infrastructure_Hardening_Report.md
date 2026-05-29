# TECHNICAL INCIDENT REPORT & INFRASTRUCTURE HARDENING LEDGER

**Project Target:** SecondServe Cloud-Native Surplus Recovery Ecosystem
**Deployment Substrate:** Microsoft Azure & Azure DevOps Pipelines
**Date of Execution:** May 29, 2026
**Compiled By:** Kok Liang (Data Tier & Infrastructure Lead)

---

## EXECUTIVE SUMMARY
On May 29, 2026, during the continuous deployment phase of the SecondServe core system, a critical frontend runtime barrier surfaced (ReferenceError: process is not defined). This error blocked client-side asset compilation and took the user interface offline. This report documents the granular technical audit, systemic code modifications, isolated feature testing, and secure branch merging executed linearly to resolve the failure and achieve a 100% verified cloud operational state.

---

## PHASE 1: MICROSOFT AZURE PLATFORM INTEGRITY AUDIT
Before applying code corrections, a deep management-plane audit was executed via the Azure CLI and Windows PowerShell to verify the baseline parameters of the shared resource group RG_SecondServe_Pilot.

### 1. Data Tier Footprint (Kok Liang)
- Target SQL Server: sqlserver-secondserve-3226.database.windows.net
- Database Instance: db-secondserve
- Operational Status: Verified Online
- SKU Tier: GP_S_Gen5 (Azure Serverless Tier for Student Cost Management)
- Ingress Firewall Policy: AllowAzureServices (0.0.0.0) fully active, allowing native cross-resource communication.

### 2. Application Substrate Matrix (Moshik & Xin Yao)
- Target Container App: aca-secondserve-backend
- Provisioning State: Succeeded
- Active Image Layer: acrsecondserve3226.azurecr.io/secondserve-backend:159
- Runtime Logs Status: PYTHONUNBUFFERED=1 active, enforcing real-time unbuffered log stream tracking.

### 3. Identity & Governance Matrix (Cross-Group RBAC)
- Scope Definition: Explicitly bound to /subscriptions/336b6caf-58d7-4b71-96a4-ec6773c5daa7/resourceGroups/RG_SecondServe_Pilot
- Assigned Role: Contributor
- Synchronized Group Members:
  * Kok Liang (Internal Infrastructure Lead)
  * Xin Yao (Internal Frontend Lead)
  * Status: Verified successfully synchronized across central active authorization tables.

---

## PHASE 2: CODE REALIGNMENT & ARCHITECTURAL MITIGATION
To resolve the browser-side crash and eliminate critical security risks prior to implementing advanced features (Azure OpenAI, Entra ID, background triggers), three key system files were completely recoded.

### 1. Frontend Asset Compilation Patch (webpack.config.js)
- Vulnerability: Webpack 5 ceased default automatic Node global polyfilling. Direct property access paths to process.env in third-party bundle dependencies leaked directly to browser runtimes, throwing a hard ReferenceError.
- Correction: Integrated Webpack's native DefinePlugin inside the build plugins array to strip out bare tokens and explicitly substitute process.env with a stringified empty object literal (JSON.stringify({})) directly at compilation time.

### 2. Backend Environment Mapping & SPA Routing (main.py)
- Vulnerability 1: Plaintext database administrative credentials were completely hardcoded in source text arrays.
- Vulnerability 2: Standard static directory mounting dropped client browser tab refreshes into raw JSON 404 loops when hitting deep client paths like /vendor-intake.
- Correction:
  * Abstracted all connection strings out of plain text into standard os.getenv() parameter structures mapped to cloud variables.
  * Implemented an advanced catch-all routing fallback handler using a regular expression path mapping (/{catchall:path}) to force FastAPI to serve index.html to the browser dynamically on all sub-route refreshes.
  * Embedded dedicated asset catch paths for /bundle.js to guarantee precise mime-type delivery (application/javascript).

### 3. Pipeline Agent Optimization (azure-pipelines.yml & Dockerfile)
- Vulnerability: Multi-stage build tasks operated on separated host runners. The secondary release agent lacked the checked-out workspace context, breaking the background expiry_engine zip packaging function.
- Correction:
  * Injected an explicit checkout: self parameter step inside the staging deployment job block to sync the repository directory onto the secondary agent.
  * Optimized the primary web app container image by removing background execution footprints, minimizing image sizes on the serverless compute node.

---

## PHASE 3: PROTECTIVE BRANCHING & REPOSITORIES GOVERNANCE
To fulfill strict continuous delivery safeguards, a defensive rollback isolation strategy was deployed via the Git version control CLI.

    # 1. Synchronized local integration tracking with remote origin
    git checkout dev-containerization
    git pull origin dev-containerization

    # 2. Spawned an isolated, sandboxed feature branch for verification
    git checkout -b feature-infrastructure-hardening

    # 3. Transferred hardened files and staged targets
    git add main.py azure-pipelines.yml Dockerfile

    # 4. Committed changes under strict project tracking headers
    git commit -m "Rule5Fist Infrastructure Hardening: Secured SQL credentials, added SPA routing..."

    # 5. Pushed the feature sandbox securely up to the cloud repository
    git push -u origin feature-infrastructure-hardening

---

## PHASE 4: ISOLATED TESTING & VALIDATION
Rather than merging blindly into the live branch, the build pipeline was tested under strict isolation conditions to verify stability:

1. A manual pipeline run was triggered directly from the Azure DevOps Pipeline Dashboard.
2. The compilation context was explicitly targeted to the feature-infrastructure-hardening branch instead of the production branch.
3. Execution Result: The build executed flawlessly in 2 minutes and 18 seconds.
   * Stage 1 (Containerization): Compiled inside 1m 19s, confirming valid Webpack configuration parsing.
   * Stage 2 (Staging Delivery): Successfully packaged and streamed the expiry_engine.zip package to the Azure Function App within 48s without empty folder errors.

---

## PHASE 5: PRODUCTION MERGING & RELEASE VERIFICATION
Following successful sandbox verification, formal code governance was finalized:

1. Pull Request Routing: Created an official Pull Request inside Azure DevOps to merge feature-infrastructure-hardening into dev-containerization.
2. Review & Sign-off: The infrastructure lead formally approved and finalized the merge tracking blocks.
3. Automated Rollout: The cloud branch trigger activated, compiling the changes automatically hands-free and pushing image tag :159 directly to production.
4. Live Validation Metrics: A clean browser verification test was performed using an Incognito window. The SecondServe user interface renders completely stable, browser path refreshes operate cleanly without dropping connection tracking, and console logging reports 0 errors.

---

## FINAL SYSTEM RESOLUTION
- Substrate Completion Rate: 100% Green / Verified
- Next Planned Objective: Advancing linearly to integrate the Azure OpenAI Service API connection blocks into main.py to support unstructured hawker dialect parsing.
