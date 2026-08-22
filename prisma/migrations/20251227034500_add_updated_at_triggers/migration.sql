-- Create a function to update the updatedAt column with current epoch timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = (EXTRACT(EPOCH FROM now())::bigint);
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updatedAt column
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_account_updated_at BEFORE UPDATE ON "Account"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_session_updated_at BEFORE UPDATE ON "Session"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_updated_at BEFORE UPDATE ON "Product"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_updated_at BEFORE UPDATE ON "Service"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_updated_at BEFORE UPDATE ON "Project"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogpost_updated_at BEFORE UPDATE ON "BlogPost"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_updated_at BEFORE UPDATE ON "Order"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_category_updated_at BEFORE UPDATE ON "Category"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategory_updated_at BEFORE UPDATE ON "SubCategory"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
