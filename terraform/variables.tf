variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "foodhawk"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "backend_image" {
  description = "Docker image for backend"
  type        = string
  default     = "foodhawk-backend:latest"
}

variable "frontend_image" {
  description = "Docker image for frontend"
  type        = string
  default     = "foodhawk-frontend:latest"
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "secret_key" {
  description = "JWT secret key"
  type        = string
  sensitive   = true
}
