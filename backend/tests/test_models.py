import pytest
from pydantic import ValidationError
from models.auth import (
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    UserResetPasswordRequest,
    UserResponse,
    TokenResponse
)
from models.form_field import (
    FormFieldCreate,
    FormFieldUpdate,
    FormFieldResponse,
    FormFieldValueCreate,
    FormFieldValueResponse,
    RatingWithValuesCreate,
    RatingWithValuesResponse,
)


class TestAuthModels:
    """Test cases for authentication models."""
    
    def test_login_request_valid(self):
        """Test valid LoginRequest."""
        request = LoginRequest(username="admin", password="password123")
        assert request.username == "admin"
        assert request.password == "password123"
    
    def test_login_request_short_username(self):
        """Test LoginRequest with username that is too short."""
        with pytest.raises(ValidationError):
            LoginRequest(username="ab", password="password123")
    
    def test_login_request_long_username(self):
        """Test LoginRequest with username that is too long."""
        with pytest.raises(ValidationError):
            LoginRequest(username="a" * 51, password="password123")
    
    def test_login_request_empty_password(self):
        """Test LoginRequest with empty password."""
        with pytest.raises(ValidationError):
            LoginRequest(username="admin", password="")
    
    def test_register_request_valid(self):
        """Test valid RegisterRequest."""
        request = RegisterRequest(username="newuser", password="password123")
        assert request.username == "newuser"
        assert request.password == "password123"
    
    def test_register_request_short_password(self):
        """Test RegisterRequest with password that is too short."""
        with pytest.raises(ValidationError):
            RegisterRequest(username="newuser", password="short")
    
    def test_register_request_invalid_username(self):
        """Test RegisterRequest with invalid username characters."""
        with pytest.raises(ValidationError):
            RegisterRequest(username="user@name", password="password123")
    
    def test_register_request_valid_username_with_underscore(self):
        """Test RegisterRequest with underscore in username."""
        request = RegisterRequest(username="user_name", password="password123")
        assert request.username == "user_name"
    
    def test_reset_password_request_valid(self):
        """Test valid ResetPasswordRequest."""
        request = ResetPasswordRequest(username="testuser", new_password="newpass123")
        assert request.username == "testuser"
        assert request.new_password == "newpass123"
    
    def test_user_reset_password_request_valid(self):
        """Test valid UserResetPasswordRequest."""
        request = UserResetPasswordRequest(
            current_password="oldpass123",
            new_password="newpass123"
        )
        assert request.current_password == "oldpass123"
        assert request.new_password == "newpass123"
    
    def test_user_response_valid(self):
        """Test valid UserResponse."""
        user = UserResponse(id=1, username="testuser", is_admin=False)
        assert user.id == 1
        assert user.username == "testuser"
        assert user.is_admin is False
    
    def test_token_response_valid(self):
        """Test valid TokenResponse."""
        token = TokenResponse(token="abc123xyz")
        assert token.token == "abc123xyz"


class TestFormFieldModels:
    """Test cases for form field models."""

    def test_form_field_create_valid(self):
        """Test valid FormFieldCreate."""
        field = FormFieldCreate(label="Severity", type="rating", is_required=True)
        assert field.label == "Severity"
        assert field.type == "rating"
        assert field.is_required is True

    def test_form_field_create_default_required(self):
        """Test FormFieldCreate default is_required value."""
        field = FormFieldCreate(label="Notes", type="text")
        assert field.is_required is False

    def test_form_field_create_empty_label(self):
        """Test FormFieldCreate with empty label."""
        with pytest.raises(ValidationError):
            FormFieldCreate(label="", type="text")

    def test_form_field_create_label_too_long(self):
        """Test FormFieldCreate with label that is too long."""
        with pytest.raises(ValidationError):
            FormFieldCreate(label="a" * 201, type="text")

    def test_form_field_create_invalid_type(self):
        """Test FormFieldCreate with invalid type."""
        with pytest.raises(ValidationError):
            FormFieldCreate(label="Test", type="invalid")

    def test_form_field_create_all_valid_types(self):
        """Test FormFieldCreate with all valid types."""
        valid_types = ["rating", "checkbox", "text", "integer"]
        for field_type in valid_types:
            field = FormFieldCreate(label="Test", type=field_type)
            assert field.type == field_type

    def test_form_field_update_partial(self):
        """Test FormFieldUpdate with partial data."""
        update = FormFieldUpdate(label="New Label")
        assert update.label == "New Label"
        assert update.type is None
        assert update.is_required is None
        assert update.position is None

    def test_form_field_update_all_fields(self):
        """Test FormFieldUpdate with all fields."""
        update = FormFieldUpdate(
            label="Updated",
            type="checkbox",
            is_required=True,
            position=5
        )
        assert update.label == "Updated"
        assert update.type == "checkbox"
        assert update.is_required is True
        assert update.position == 5

    def test_form_field_update_negative_position(self):
        """Test FormFieldUpdate with negative position."""
        with pytest.raises(ValidationError):
            FormFieldUpdate(position=-1)

    def test_form_field_response_valid(self):
        """Test valid FormFieldResponse."""
        response = FormFieldResponse(
            id=1,
            project_id=1,
            label="Test",
            type="rating",
            is_required=True,
            position=0
        )
        assert response.id == 1
        assert response.project_id == 1
        assert response.label == "Test"
        assert response.type == "rating"
        assert response.is_required is True
        assert response.position == 0

    def test_form_field_value_create_valid(self):
        """Test valid FormFieldValueCreate."""
        value = FormFieldValueCreate(form_field_id=1, value="5")
        assert value.form_field_id == 1
        assert value.value == "5"

    def test_form_field_value_create_invalid_field_id(self):
        """Test FormFieldValueCreate with invalid form_field_id."""
        with pytest.raises(ValidationError):
            FormFieldValueCreate(form_field_id=0, value="test")

    def test_form_field_value_response_valid(self):
        """Test valid FormFieldValueResponse."""
        response = FormFieldValueResponse(
            id=1,
            form_field_id=2,
            rating_id=3,
            value="test value"
        )
        assert response.id == 1
        assert response.form_field_id == 2
        assert response.rating_id == 3
        assert response.value == "test value"

    def test_rating_with_values_create_valid(self):
        """Test valid RatingWithValuesCreate."""
        rating = RatingWithValuesCreate(
            field_values=[
                FormFieldValueCreate(form_field_id=1, value="5"),
                FormFieldValueCreate(form_field_id=2, value="true")
            ]
        )
        assert len(rating.field_values) == 2

    def test_rating_with_values_create_empty_values(self):
        """Test RatingWithValuesCreate with empty field_values."""
        rating = RatingWithValuesCreate(field_values=[])
        assert rating.field_values == []

    def test_rating_with_values_response_valid(self):
        """Test valid RatingWithValuesResponse."""
        response = RatingWithValuesResponse(
            id=1,
            mutant_id=2,
            user_id=3,
            field_values=[
                FormFieldValueResponse(id=1, form_field_id=1, rating_id=1, value="5")
            ]
        )
        assert response.id == 1
        assert response.mutant_id == 2
        assert response.user_id == 3
        assert len(response.field_values) == 1
