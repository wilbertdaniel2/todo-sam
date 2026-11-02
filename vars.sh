STACK=todo-sam-wilbert

out() {
  aws cloudformation describe-stacks --stack-name "$STACK" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text
}

export API=$(out ApiUrl)
export TOPIC_ARN=$(out TopicArn)
export AUDIT_Q=$(out AuditQueueUrl)
export NOTIF_Q=$(out NotificationsQueueUrl)
export NOTIF_DLQ=$(out NotificationsDLQUrl)
export NOTIF_DLQ_ARN=$(out NotificationsDLQArn)

echo "API:        $API"
echo "TOPIC_ARN:  $TOPIC_ARN"
echo "AUDIT_Q:    $AUDIT_Q"
echo "NOTIF_DLQ:  $NOTIF_DLQ"