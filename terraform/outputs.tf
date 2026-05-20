output "alb_dns_name" {
  description = "DNS name of the load balancer"
  value       = aws_lb.foodhawk_alb.dns_name
}

output "db_endpoint" {
  description = "RDS database endpoint"
  value       = aws_db_instance.foodhawk_db.endpoint
  sensitive   = true
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.foodhawk_cluster.name
}
